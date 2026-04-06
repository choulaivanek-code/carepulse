package com.carepulse.carepulse.service;

import com.carepulse.carepulse.dto.request.FeedbackRequest;
import com.carepulse.carepulse.entity.Feedback;
import com.carepulse.carepulse.entity.Patient;
import com.carepulse.carepulse.entity.Ticket;
import com.carepulse.carepulse.exception.ResourceNotFoundException;
import com.carepulse.carepulse.repository.FeedbackRepository;
import com.carepulse.carepulse.repository.PatientRepository;
import com.carepulse.carepulse.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final TicketRepository ticketRepository;
    private final PatientRepository patientRepository;

    @Transactional
    public Feedback soumettreFeedback(FeedbackRequest request, Long userId) {
        log.info("Soumission d'un feedback par l'utilisateur {}", userId);
        
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient non trouvé"));
        
        Ticket ticket = ticketRepository.findById(request.getTicketId())
                .orElseThrow(() -> new ResourceNotFoundException("Ticket non trouvé"));

        Feedback feedback = Feedback.builder()
                .ticket(ticket)
                .patient(patient)
                .noteGlobale(request.getNoteGlobale())
                .noteAttenteTemps(request.getNoteAttenteTemps())
                .noteAccueil(request.getNoteAccueil())
                .noteMedecin(request.getNoteMedecin())
                .noteProprete(request.getNoteProprete())
                .commentaire(request.getCommentaire())
                .pointsPositifs(request.getPointsPositifs())
                .axesAmelioration(request.getAxesAmelioration())
                .recommande(request.isRecommande())
                .anonyme(request.isAnonyme())
                .modere(false)
                .build();

        return feedbackRepository.save(feedback);
    }

    public List<Feedback> getFeedbacksNonModeres() {
        return feedbackRepository.findByModereFalse();
    }

    @Transactional
    public void modererFeedback(Long feedbackId, boolean approuve) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback non trouvé"));
        feedback.setModere(true);
        // logic based on approuve (e.g. delete if not approved)
        feedbackRepository.save(feedback);
    }
}
