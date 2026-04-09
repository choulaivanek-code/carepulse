package com.carepulse.carepulse.service;

import java.time.format.DateTimeFormatter;

import com.carepulse.carepulse.dto.request.CreateTicketRequest;
import com.carepulse.carepulse.entity.*;
import com.carepulse.carepulse.enums.TicketStatus;
import com.carepulse.carepulse.enums.PriorityType;
import com.carepulse.carepulse.exception.CarePulseException;
import com.carepulse.carepulse.exception.ResourceNotFoundException;
import com.carepulse.carepulse.integration.MLServiceClient;
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
    private final MLServiceClient mlServiceClient;

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
                .estUrgence(PriorityType.URGENT.equals(request.getPriorite()) || request.isEstUrgence())
                .justificationUrgence(request.getJustificationUrgence())
                .heureCreation(LocalDateTime.now())
                .estPresent(true)
                .build();

        ticket.setScoreTotal(priorisationService.calculerScore(ticket, patient));

        // Trouve un médecin disponible dans la file choisie
        medecinRepository.findFirstByFileAttenteAndDisponibleTrue(file)
                .ifPresent(ticket::setMedecin);
        
        ticketRepository.save(ticket);
        
        fileAttenteService.recalculerTousLesTemps(file.getId());
        
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
        Ticket suivant = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket non trouvé"));
        
        suivant.setStatut(TicketStatus.READY);
        suivant.setHeureAppel(LocalDateTime.now());
        
        ticketRepository.save(suivant);
        
        webSocketService.sendTicketUpdate(suivant.getId(), "READY", 0, 0, "Vous êtes appelé en salle de consultation");
        fileAttenteService.recalculerTousLesTemps(suivant.getFileAttente().getId());
        
        return suivant;
    }

    @Transactional
    public void confirmerPresence(Long ticketId) {
        Ticket ticket = getTicketById(ticketId);
        ticket.setStatut(TicketStatus.PRESENT);
        ticket.setEstPresent(true);
        ticketRepository.save(ticket);
    }

    @Transactional
    public void signalerAbsence(Long ticketId) {
        Ticket ticket = getTicketById(ticketId);
        ticket.setEstPresent(false);
        ticket.setStatut(TicketStatus.NO_SHOW);
        ticketRepository.save(ticket);
        gererNoShow(ticketId);
    }

    @Transactional
    public void annulerTicket(Long ticketId) {
        Ticket ticket = getTicketById(ticketId);
        ticket.setStatut(TicketStatus.CANCELLED);
        ticketRepository.save(ticket);
        fileAttenteService.recalculerTousLesTemps(ticket.getFileAttente().getId());
    }

    public void gererNoShow(Long ticketId) {
        Ticket ticket = getTicketById(ticketId);
        Patient patient = ticket.getPatient();
        patient.setNombreNoShows(patient.getNombreNoShows() + 1);
        patient.setScoreFiabilite(patient.getScoreFiabilite() * 0.9);
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
        
        return ticketRepository.findByFileAttenteAndStatutIn(medecin.getFileAttente(), statutsActifs);
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
