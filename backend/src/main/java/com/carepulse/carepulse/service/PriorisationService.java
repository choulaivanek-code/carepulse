package com.carepulse.carepulse.service;

import com.carepulse.carepulse.entity.Patient;
import com.carepulse.carepulse.entity.ReglePriorisation;
import com.carepulse.carepulse.entity.Ticket;
import com.carepulse.carepulse.repository.ReglePriorisationRepository;
import com.carepulse.carepulse.util.Constants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class PriorisationService {

    private final ReglePriorisationRepository reglePriorisationRepository;

    public int calculerScore(Ticket ticket, Patient patient) {
        log.info("Calcul du score de priorité pour le ticket {}", ticket.getNumeroTicket());
        int scoreTotal = 0;

        List<ReglePriorisation> regles = reglePriorisationRepository.findByActifTrueOrderByOrdreApplicationAsc();

        for (ReglePriorisation regle : regles) {
            switch (regle.getCritere()) {
                case "AGE":
                    // Si age > 70
                    // Note: logic simplified for example, assuming user has birthdate
                    scoreTotal += regle.getScoreAjoute();
                    break;
                case "URGENCE":
                    if (ticket.isEstUrgence()) {
                        scoreTotal += regle.getScoreAjoute();
                    }
                    break;
                case "GROSSESSE":
                    if (Boolean.TRUE.equals(patient.getEstEnceinte())) {
                        scoreTotal += regle.getScoreAjoute();
                    }
                    break;
                case "HANDICAP":
                    if (Boolean.TRUE.equals(patient.getAHandicap())) {
                        scoreTotal += regle.getScoreAjoute();
                    }
                    break;
                case "ATTENTE":
                    long minutesAttente = Duration.between(ticket.getHeureCreation(), LocalDateTime.now()).toMinutes();
                    if (minutesAttente > 60) {
                        scoreTotal += regle.getScoreAjoute();
                    }
                    break;
            }
        }

        log.info("Score final pour le ticket {}: {}", ticket.getNumeroTicket(), scoreTotal);
        return scoreTotal;
    }
}
