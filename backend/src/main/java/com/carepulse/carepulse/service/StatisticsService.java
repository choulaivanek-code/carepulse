package com.carepulse.carepulse.service;

import com.carepulse.carepulse.dto.response.StatsDashboardResponse;
import com.carepulse.carepulse.enums.TicketStatus;
import com.carepulse.carepulse.repository.FeedbackRepository;
import com.carepulse.carepulse.repository.MedecinRepository;
import com.carepulse.carepulse.repository.TicketRepository;
import com.carepulse.carepulse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class StatisticsService {

    private final TicketRepository ticketRepository;
    private final MedecinRepository medecinRepository;
    private final UserRepository userRepository;
    private final FeedbackRepository feedbackRepository;

    public StatsDashboardResponse getDashboardStats() {
        log.info("Récupération des statistiques du tableau de bord");

        LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);

        // --- Agent KPI fields (exact DB counts) ---
        // EN ATTENTE
        long enAttente = ticketRepository.countByStatutIn(
            List.of(TicketStatus.WAITING, TicketStatus.READY, TicketStatus.PRESENT)
        );

        // EN COURS
        long enCours = ticketRepository.countByStatutIn(
            List.of(TicketStatus.IN_PROGRESS)
        );

        // ABSENCES du jour
        long absences = ticketRepository.countByStatutAndHeureCreationBetween(
            TicketStatus.NO_SHOW,
            LocalDate.now().atStartOfDay(),
            LocalDate.now().plusDays(1).atStartOfDay()
        );
        double satisfaction = feedbackRepository.averageScore().orElse(0.0);
        // Round to 1 decimal
        satisfaction = Math.round(satisfaction * 10.0) / 10.0;

        // --- Legacy fields ---
        int ticketsActifs = (int) (enAttente + enCours);
        long totalTicketsToday = ticketRepository.countByStatutAndHeureCreationAfter(TicketStatus.COMPLETED, today);
        int medecinsDispo = medecinRepository.findByDisponibleTrue().size();

        double noShows    = ticketRepository.countByStatut(TicketStatus.NO_SHOW);
        double totalTickets = ticketRepository.count();
        double tauxNoShow = totalTickets > 0 ? (noShows / totalTickets) : 0.0;

        return StatsDashboardResponse.builder()
                // Legacy
                .ticketsActifs(ticketsActifs)
                .ticketsAujourdhui((int) totalTicketsToday)
                .medecinsDisponibles(medecinsDispo)
                .tauxOccupation(0.85)
                .tempsAttenteMoyen(18.5)
                .tauxNoShow(tauxNoShow)
                .tauxSatisfaction(satisfaction)
                // Agent KPIs
                .enAttente(enAttente)
                .enCours(enCours)
                .absences(absences)
                .satisfaction(satisfaction)
                .build();
    }
}

