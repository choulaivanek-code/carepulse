package com.carepulse.carepulse.service;

import java.time.format.DateTimeFormatter;

import com.carepulse.carepulse.dto.request.CreateTicketRequest;
import com.carepulse.carepulse.entity.*;
import com.carepulse.carepulse.enums.TicketStatus;
import com.carepulse.carepulse.enums.PriorityType;
import com.carepulse.carepulse.exception.CarePulseException;
import com.carepulse.carepulse.exception.ResourceNotFoundException;
import com.carepulse.carepulse.integration.MLServiceClient;
import com.carepulse.carepulse.integration.WaitTimeRequest;
import com.carepulse.carepulse.integration.NoShowRequest;
import com.carepulse.carepulse.repository.*;
import com.carepulse.carepulse.util.Constants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import jakarta.annotation.PostConstruct;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final FileAttenteRepository fileAttenteRepository;
    private final MedecinRepository medecinRepository;
    private final PriorisationService priorisationService;
    private final FileAttenteService fileAttenteService;
    private final WebSocketService webSocketService;
    private final NotificationService notificationService;
    private final AgentRepository agentRepository;
    private final MLServiceClient mlServiceClient;
    private final ParametreSystemeRepository parametreSystemeRepository;

    @PostConstruct
    public void reassignerTicketsOrphelins() {
        log.info("Lancement de la réassignation des tickets orphelins...");
        List<TicketStatus> statutsActifs = List.of(
            TicketStatus.WAITING, 
            TicketStatus.PRESENT, 
            TicketStatus.READY, 
            TicketStatus.IN_PROGRESS
        );

        List<Ticket> ticketsSansMedecin = ticketRepository.findByMedecinIsNullAndStatutIn(statutsActifs);
        
        for (Ticket ticket : ticketsSansMedecin) {
            if (ticket.getFileAttente() == null) {
                log.warn("Ticket {} n'a pas de file d'attente, saut de réassignation", ticket.getNumeroTicket());
                continue;
            }
            
            medecinRepository.findFirstByFileAttenteAndDisponibleTrue(ticket.getFileAttente())
                .ifPresent(medecin -> {
                    log.info("Réassignation du ticket {} au médecin {}", ticket.getNumeroTicket(), medecin.getUser().getNom());
                    ticket.setMedecin(medecin);
                    ticketRepository.save(ticket);
                });
        }
    }

    @Scheduled(fixedRate = 300000) // Toutes les 5 minutes
    public void reassignerTicketsOrphelinsPeriodique() {
        reassignerTicketsOrphelins();
    }

    @Transactional
    public Ticket creerTicket(CreateTicketRequest request, Long userId) {
        log.info("Création d'un ticket pour l'utilisateur {}", userId);
        
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient introuvable"));

        // Vérifie que le patient n'a pas déjà un ticket actif (ni WAITING, PRESENT, READY, ou IN_PROGRESS)
        boolean hasActiveTicket = ticketRepository.existsByPatientAndStatutIn(
                patient,
                List.of(TicketStatus.WAITING, TicketStatus.PRESENT, TicketStatus.READY, TicketStatus.IN_PROGRESS)
        );
        if (hasActiveTicket) {
            throw new CarePulseException("Vous avez déjà un ticket actif en cours", HttpStatus.BAD_REQUEST);
        }

        FileAttente file = fileAttenteRepository.findById(request.getFileAttenteId())
                .orElseThrow(() -> new ResourceNotFoundException("File d'attente non trouvée"));

        // Numérotation automatique unique et incrémentale
        String numeroTicket = genererNumeroTicket(file);

        Ticket ticket = Ticket.builder()
                .patient(patient)
                .fileAttente(file)
                .numeroTicket(numeroTicket)
                .statut(TicketStatus.WAITING)
                .priorite(request.getPriorite() != null ? request.getPriorite() : PriorityType.NORMAL)
                .motif(request.getMotif())
                .estUrgence(PriorityType.URGENT.equals(request.getPriorite()) || request.getEstUrgence())
                .justificationUrgence(request.getJustificationUrgence())
                .heureCreation(LocalDateTime.now())
                .estPresent(true)
                .build();

        ticket.setScoreTotal(priorisationService.calculerScore(ticket, patient));

        // Intégration IA Predictive
        String moteurML = "false";
        try {
            moteurML = parametreSystemeRepository.findByCle("moteur_ml")
                    .map(ParametreSysteme::getValeur)
                    .orElse("false");
        } catch (Exception e) {
            log.warn("Erreur lecture moteur_ml, fallback simple");
        }

        if ("true".equals(moteurML)) {
            try {
                WaitTimeRequest wtReq = WaitTimeRequest.builder()
                        .heure(LocalDateTime.now().getHour())
                        .jourSemaine(LocalDateTime.now().getDayOfWeek().getValue())
                        .fileId(file.getId().intValue())
                        .nbTicketsActifs((int) ticketRepository.countByFileAttenteAndStatutIn(file, 
                            List.of(TicketStatus.WAITING, TicketStatus.PRESENT, TicketStatus.READY)))
                        .priorite(ticket.getPriorite().ordinal())
                        .build();
                
                com.carepulse.carepulse.integration.WaitTimeResponse wtRes = mlServiceClient.predictWaitTime(wtReq);
                ticket.setTempsAttenteEstime(wtRes.getTempsAttenteMinutes());

                NoShowRequest nsReq = NoShowRequest.builder()
                        .heure(LocalDateTime.now().getHour())
                        .jourSemaine(LocalDateTime.now().getDayOfWeek().getValue())
                        .historiqueNoShow(patient.getNombreNoShows())
                        .priorite(ticket.getPriorite().ordinal())
                        .build();
                
                com.carepulse.carepulse.integration.NoShowResponse nsRes = mlServiceClient.predictNoShow(nsReq);
                ticket.setScoreNoShow(nsRes.getScoreNoShow());
                
                log.info("IA : Temps attendu={} min, Score No-Show={}", ticket.getTempsAttenteEstime(), ticket.getScoreNoShow());
            } catch (Exception e) {
                log.error("Échec prédiction IA, utilisation fallback: {}", e.getMessage());
                ticket.setTempsAttenteEstime(15);
                ticket.setScoreNoShow(0.0);
            }
        } else {
            ticket.setTempsAttenteEstime(15);
            ticket.setScoreNoShow(0.0);
        }

        // Trouve un médecin disponible dans la file choisie
        medecinRepository.findFirstByFileAttenteAndDisponibleTrue(file)
                .ifPresent(ticket::setMedecin);
        
        ticketRepository.save(ticket);
        
        fileAttenteService.recalculerTousLesTemps(file.getId());

        // Notifications
        // 1. Pour le patient
        notificationService.envoyerNotification(
            userId,
            "Ticket créé",
            "Votre ticket " + ticket.getNumeroTicket() + " a été créé",
            com.carepulse.carepulse.enums.NotificationType.TICKET_CREE,
            ticket.getId()
        );

        // 2. Pour les agents
        agentRepository.findAll().forEach(agent -> 
            notificationService.envoyerNotification(
                agent.getUser().getId(),
                "Nouveau ticket",
                "Nouveau ticket " + ticket.getNumeroTicket() + " — " + ticket.getPatient().getUser().getPrenom(),
                com.carepulse.carepulse.enums.NotificationType.NOUVEAU_TICKET,
                ticket.getId()
            )
        );

        // 3. Notifications spécifiques aux urgences
        if (ticket.getPriorite() == PriorityType.URGENT) {
            // Notifier le médecin assigné
            if (ticket.getMedecin() != null) {
                notificationService.envoyerNotification(
                    ticket.getMedecin().getUser().getId(),
                    "🚨 URGENCE — Intervention requise",
                    "Patient " + patient.getUser().getPrenom() + " " + patient.getUser().getNom()
                        + " — " + ticket.getNumeroTicket() + " — Priorité URGENTE",
                    com.carepulse.carepulse.enums.NotificationType.URGENCE,
                    ticket.getId()
                );
            }

            // Notifier les patients WAITING dans la même file (leur position va changer)
            List<Ticket> ticketsEnAttente = ticketRepository.findByFileAttenteAndStatutIn(
                file,
                List.of(TicketStatus.WAITING)
            );
            ticketsEnAttente.stream()
                .filter(t -> !t.getId().equals(ticket.getId()))
                .forEach(t -> notificationService.envoyerNotification(
                    t.getPatient().getUser().getId(),
                    "Position mise à jour",
                    "Un cas urgent a été ajouté — votre position dans la file a changé",
                    com.carepulse.carepulse.enums.NotificationType.POSITION_MISE_A_JOUR,
                    ticket.getId()
                ));
        }
        
        return ticket;
    }

    private String genererNumeroTicket(FileAttente fileAttente) {
        // Trouve le dernier ticket de cette file aujourd'hui
        LocalDate aujourdhui = LocalDate.now();
        Optional<Ticket> dernierTicket = ticketRepository
            .findTopByFileAttenteAndHeureCreationBetweenOrderByNumeroTicketDesc(
                fileAttente,
                aujourdhui.atStartOfDay(),
                aujourdhui.plusDays(1).atStartOfDay()
            );
        
        int numero = 1;
        if (dernierTicket.isPresent()) {
            // Extrait le numéro et incrémente
            String dernierNumero = dernierTicket.get().getNumeroTicket();
            try {
                // Extrait la partie séquence avant le tiret (ex: G001-260408 -> G001)
                String sequencePart = dernierNumero.contains("-") ? dernierNumero.split("-")[0] : dernierNumero;
                numero = Integer.parseInt(sequencePart.replaceAll("[^0-9]", "")) + 1;
            } catch (NumberFormatException e) {
                numero = ticketRepository.countByFileAttenteAndHeureCreationBetween(
                    fileAttente,
                    aujourdhui.atStartOfDay(),
                    aujourdhui.plusDays(1).atStartOfDay()
                ).intValue() + 1;
            }
        }
        
        // Format : préfixe de la file + numéro sur 3 chiffres + suffixe date (ex: S001-260408)
        String prefixe = fileAttente.getNom() != null && !fileAttente.getNom().isEmpty() ? 
            fileAttente.getNom().substring(0, 1).toUpperCase() : "T";
        String dateSuffix = aujourdhui.format(DateTimeFormatter.ofPattern("yyMMdd"));
        return String.format("%s%03d-%s", prefixe, numero, dateSuffix);
    }

    public List<Ticket> getMesTickets(Long userId) {
        Optional<Patient> patientOpt = patientRepository.findByUserId(userId);
        if (patientOpt.isEmpty()) {
            return new ArrayList<>();
        }
        return ticketRepository.findByPatient(patientOpt.get());
    }

    @Transactional
    public Ticket appellerPatient(Long ticketId, Long userId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket non trouvé"));
        
        // Correction 3 — Assigner automatiquement un médecin si null
        if (ticket.getMedecin() == null && ticket.getFileAttente() != null) {
            medecinRepository.findFirstByFileAttenteAndDisponibleTrue(ticket.getFileAttente())
                .ifPresent(medecin -> {
                    ticket.setMedecin(medecin);
                    ticketRepository.save(ticket);
                });
        }

        ticket.setStatut(TicketStatus.READY);
        ticket.setHeureAppel(LocalDateTime.now());
        
        ticketRepository.save(ticket);
        
        // Correction 2 — Vérification null avant d'accéder au médecin
        String nomMedecin = "votre médecin";
        if (ticket.getMedecin() != null && ticket.getMedecin().getUser() != null) {
            nomMedecin = "Dr. " + ticket.getMedecin().getUser().getNom();
        }

        // Notifications
        // 1. Pour le patient
        notificationService.envoyerNotification(
            ticket.getPatient().getUser().getId(),
            "C'est votre tour !",
            "Présentez-vous au cabinet de " + nomMedecin,
            com.carepulse.carepulse.enums.NotificationType.APPEL_PATIENT,
            ticket.getId()
        );

        // 2. Pour le médecin (si assigné)
        if (ticket.getMedecin() != null) {
            notificationService.envoyerNotification(
                ticket.getMedecin().getUser().getId(),
                "Patient prêt",
                "Le patient " + ticket.getPatient().getUser().getPrenom() + " est prêt",
                com.carepulse.carepulse.enums.NotificationType.PATIENT_PRET,
                ticket.getId()
            );
        }

        webSocketService.sendTicketUpdate(ticket.getId(), "READY", 0, 0, "Vous êtes appelé en salle de consultation");
        fileAttenteService.recalculerTousLesTemps(ticket.getFileAttente().getId());
        
        return ticket;
    }

    @Transactional
    public void confirmerPresence(Long ticketId) {
        Ticket ticket = getTicketById(ticketId);
        ticket.setStatut(TicketStatus.PRESENT);
        ticket.setEstPresent(true);
        
        Patient patient = ticket.getPatient();
        patient.setPointsFidelite(patient.getPointsFidelite() + 5);
        patientRepository.save(patient);
        
        ticketRepository.save(ticket);
    }

    @Transactional
    public void signalerAbsence(Long ticketId) {
        Ticket ticket = getTicketById(ticketId);
        ticket.setEstPresent(false);
        ticket.setStatut(TicketStatus.NO_SHOW);
        ticketRepository.save(ticket);
        gererNoShow(ticketId);

        // Notifier tous les agents
        agentRepository.findAll().forEach(agent ->
            notificationService.envoyerNotification(
                agent.getUser().getId(),
                "Patient absent",
                "Le patient " + ticket.getPatient().getUser().getPrenom()
                + " " + ticket.getPatient().getUser().getNom()
                + " a signalé son absence — Ticket " + ticket.getNumeroTicket(),
                com.carepulse.carepulse.enums.NotificationType.ABSENCE_SIGNALEE,
                ticket.getId()
            )
        );

        // Notifier le médecin si assigné
        if (ticket.getMedecin() != null) {
            notificationService.envoyerNotification(
                ticket.getMedecin().getUser().getId(),
                "Patient absent",
                "Le patient " + ticket.getPatient().getUser().getPrenom()
                + " ne se présentera pas — Ticket " + ticket.getNumeroTicket(),
                com.carepulse.carepulse.enums.NotificationType.ABSENCE_SIGNALEE,
                ticket.getId()
            );
        }
    }

    @Transactional
    public void annulerTicket(Long ticketId) {
        Ticket ticket = getTicketById(ticketId);
        ticket.setStatut(TicketStatus.CANCELLED);
        ticketRepository.save(ticket);
        fileAttenteService.recalculerTousLesTemps(ticket.getFileAttente().getId());

        // Notifier tous les agents
        agentRepository.findAll().forEach(agent ->
            notificationService.envoyerNotification(
                agent.getUser().getId(),
                "Ticket annulé",
                "Le patient " + ticket.getPatient().getUser().getPrenom()
                + " " + ticket.getPatient().getUser().getNom()
                + " a annulé son ticket " + ticket.getNumeroTicket()
                + " — " + ticket.getFileAttente().getNom(),
                com.carepulse.carepulse.enums.NotificationType.TICKET_ANNULE,
                ticket.getId()
            )
        );

        // Notifier le médecin si assigné
        if (ticket.getMedecin() != null) {
            notificationService.envoyerNotification(
                ticket.getMedecin().getUser().getId(),
                "Ticket annulé",
                "Le patient " + ticket.getPatient().getUser().getPrenom()
                + " a annulé son ticket " + ticket.getNumeroTicket(),
                com.carepulse.carepulse.enums.NotificationType.TICKET_ANNULE,
                ticket.getId()
            );
        }
    }

    public void gererNoShow(Long ticketId) {
        Ticket ticket = getTicketById(ticketId);
        Patient patient = ticket.getPatient();
        patient.setNombreNoShows(patient.getNombreNoShows() + 1);
        patient.setScoreFiabilite(patient.getScoreFiabilite() * 0.9);
        
        // Pénalité de points fidélité
        patient.setPointsFidelite(Math.max(0, patient.getPointsFidelite() - 5));
        
        patientRepository.save(patient);
    }

    public List<Ticket> getTicketsEnAttente(Long fileAttenteId) {
        FileAttente file = fileAttenteRepository.findById(fileAttenteId)
                .orElseThrow(() -> new ResourceNotFoundException("File non trouvée"));
        List<TicketStatus> statutsActifs = List.of(
            TicketStatus.WAITING, 
            TicketStatus.PRESENT, 
            TicketStatus.READY, 
            TicketStatus.IN_PROGRESS
        );
        return ticketRepository.findByFileAttente(file).stream()
                .filter(t -> statutsActifs.contains(t.getStatut()))
                .collect(Collectors.toList());
    }

    public List<Ticket> getTousLesTicketsActifs() {
        List<TicketStatus> statutsActifs = List.of(
            TicketStatus.WAITING, 
            TicketStatus.PRESENT, 
            TicketStatus.READY, 
            TicketStatus.IN_PROGRESS
        );
        return ticketRepository.findByStatutIn(statutsActifs);
    }

    public List<Ticket> getTicketsForMedecinConsole(Long userId) {
        Medecin medecin = medecinRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Médecin non trouvé"));
        
        List<TicketStatus> statutsActifs = List.of(
            TicketStatus.WAITING, 
            TicketStatus.PRESENT, 
            TicketStatus.READY, 
            TicketStatus.IN_PROGRESS
        );
        
        return ticketRepository.findByFileAttenteAndStatutIn(medecin.getFileAttente(), statutsActifs)
                .stream()
                .sorted(java.util.Comparator
                    .comparingInt((Ticket t) -> prioriteOrder(t.getPriorite()))
                    .thenComparing(Ticket::getHeureCreation))
                .collect(Collectors.toList());
    }

    private int prioriteOrder(PriorityType priorite) {
        if (priorite == null) return 4;
        return switch (priorite) {
            case URGENT   -> 0;
            case HIGH     -> 1;
            case MODERATE -> 2;
            case NORMAL   -> 3;
        };
    }

    public Ticket getTicketById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket non trouvé"));
    }

    public int getTicketPosition(Ticket t) {
        long position = ticketRepository.countTicketsAvant(
            t.getFileAttente(), 
            List.of(TicketStatus.WAITING, TicketStatus.PRESENT, TicketStatus.READY), 
            t.getHeureCreation()
        );
        return (int) (position + 1);
    }
}
