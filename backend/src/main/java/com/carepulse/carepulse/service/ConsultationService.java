package com.carepulse.carepulse.service;

import com.carepulse.carepulse.dto.request.ConsultationRequest;
import com.carepulse.carepulse.entity.Consultation;
import com.carepulse.carepulse.entity.Medecin;
import com.carepulse.carepulse.entity.Ticket;
import com.carepulse.carepulse.enums.TicketStatus;
import com.carepulse.carepulse.exception.ResourceNotFoundException;
import com.carepulse.carepulse.entity.Patient;
import com.carepulse.carepulse.repository.ConsultationRepository;
import com.carepulse.carepulse.repository.MedecinRepository;
import com.carepulse.carepulse.repository.PatientRepository;
import com.carepulse.carepulse.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final TicketRepository ticketRepository;
    private final MedecinRepository medecinRepository;
    private final PatientRepository patientRepository;
    private final NotificationService notificationService;

    @Transactional
    public Consultation demarrerConsultation(Long ticketId, Long medecinId) {
        log.info("Démarrage de la consultation pour le ticket {}", ticketId);
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket non trouvé"));
        
        Medecin medecin = medecinRepository.findByUserId(medecinId)
                .orElseThrow(() -> new ResourceNotFoundException("Médecin non trouvé"));

        ticket.setStatut(TicketStatus.IN_PROGRESS);
        ticket.setHeureDebut(LocalDateTime.now());
        ticketRepository.save(ticket);

        // Avant de créer une consultation, vérifier s'il n'en existe pas déjà une active
        java.util.Optional<Consultation> existante = consultationRepository.findFirstByTicketOrderByIdDesc(ticket);
        if (existante.isPresent() && existante.get().getDateFin() == null) {
            return existante.get();
        }

        Consultation consultation = Consultation.builder()
                .ticket(ticket)
                .medecin(medecin)
                .patient(ticket.getPatient())
                .type(ticket.getEstUrgence() ? com.carepulse.carepulse.enums.ConsultationType.URGENCE : com.carepulse.carepulse.enums.ConsultationType.GENERALE)
                .dateDebut(LocalDateTime.now())
                .build();

        Consultation saved = consultationRepository.save(consultation);

        // Notification patient
        notificationService.envoyerNotification(
            ticket.getPatient().getUser().getId(),
            "Consultation commencée",
            "Votre consultation avec le Dr. " + medecin.getUser().getNom() + " a commencé",
            com.carepulse.carepulse.enums.NotificationType.CONSULTATION_DEMARREE,
            ticket.getId()
        );

        return saved;
    }

    @Transactional
    public void saisirContenuMedical(Long ticketId, ConsultationRequest request) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket non trouvé"));
        
        Consultation consultation = consultationRepository.findFirstByTicketOrderByIdDesc(ticket)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation non trouvée"));

        consultation.setSymptomes(request.getSymptomes());
        consultation.setDiagnostic(request.getDiagnostic());
        consultation.setTraitement(request.getTraitement());
        consultation.setExamens(request.getExamens());
        consultation.setObservationsInternes(request.getObservationsInternes());
        
        consultationRepository.save(consultation);
    }

    @Transactional
    public void cloturerConsultation(Long ticketId, Long medecinId) {
        log.info("Clôture de la consultation pour le ticket {}", ticketId);
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket non trouvé"));
        
        Consultation consultation = consultationRepository.findFirstByTicketOrderByIdDesc(ticket)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation non trouvée"));

        ticket.setStatut(TicketStatus.COMPLETED);
        ticket.setHeureFin(LocalDateTime.now());
        ticketRepository.save(ticket);

        consultation.setDateFin(LocalDateTime.now());
        consultation.setDureeReelle((int) Duration.between(consultation.getDateDebut(), consultation.getDateFin()).toMinutes());
        consultationRepository.save(consultation);

        // Notification patient
        notificationService.envoyerNotification(
            ticket.getPatient().getUser().getId(),
            "Consultation terminée",
            "Votre consultation est terminée. Merci de votre confiance.",
            com.carepulse.carepulse.enums.NotificationType.CONSULTATION_TERMINEE,
            ticket.getId()
        );
    }

    public List<Consultation> getConsultationsByPatientId(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient non trouvé"));
        return consultationRepository.findByPatient(patient);
    }

    public List<Consultation> getConsultationsByUserId(Long userId) {
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient non trouvé"));
        return consultationRepository.findByPatient(patient);
    }
}
