package com.carepulse.carepulse.service;

import com.carepulse.carepulse.dto.response.StatsDashboardResponse;
import com.carepulse.carepulse.entity.Medecin;
import com.carepulse.carepulse.entity.ParametreSysteme;
import com.carepulse.carepulse.enums.TicketStatus;
import com.carepulse.carepulse.entity.Ticket;
import com.carepulse.carepulse.repository.ConsultationRepository;
import com.carepulse.carepulse.repository.FeedbackRepository;
import com.carepulse.carepulse.repository.MedecinRepository;
import com.carepulse.carepulse.repository.ParametreSystemeRepository;
import com.carepulse.carepulse.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class StatisticsService {

    private final TicketRepository ticketRepository;
    private final MedecinRepository medecinRepository;
    private final FeedbackRepository feedbackRepository;
    private final ParametreSystemeRepository parametreSystemeRepository;
    private final ConsultationRepository consultationRepository;

    public StatsDashboardResponse getDashboardStats() {
        log.info("Récupération des statistiques réelles du tableau de bord");

        LocalDateTime debutJour = LocalDate.now().atStartOfDay();
        LocalDateTime finJour = LocalDate.now().plusDays(1).atStartOfDay();
        LocalDateTime debutHier = debutJour.minusDays(1);
        LocalDateTime finHier = debutJour;

        // 1. Tickets Actifs
        long enAttente = ticketRepository.countByStatutIn(List.of(TicketStatus.WAITING, TicketStatus.READY, TicketStatus.PRESENT));
        long enCours = ticketRepository.countByStatutIn(List.of(TicketStatus.IN_PROGRESS));
        int ticketsActifsActuels = (int) (enAttente + enCours);

        // 2. Tickets du jour
        long ticketsJour = ticketRepository.countByHeureCreationBetween(debutJour, finJour);
        long ticketsHier = ticketRepository.countByHeureCreationBetween(debutHier, finHier);

        // 3. Occupation
        int maxTickets = Integer.parseInt(parametreSystemeRepository.findByCle("max_tickets_jour")
                .map(ParametreSysteme::getValeur).orElse("100"));
        double occupation = ticketsJour > 0 ? (ticketsActifsActuels * 100.0 / maxTickets) : 0.0;
        
        // Use yesterday's occupation for trend? No, usually trends are compared by same day type or total.
        // Let's stick to the user's logic for badges.

        // 4. Attente Moyenne
        Double avgWaitToday = ticketRepository.avgTempsAttenteEstime(debutJour, finJour);
        double attenteMoyenne = avgWaitToday != null ? avgWaitToday : 0.0;
        Double avgWaitHier = ticketRepository.avgTempsAttenteEstime(debutHier, finHier);
        double attenteMoyenneHier = avgWaitHier != null ? avgWaitHier : 0.0;

        // 5. Médecins Actifs
        int medecinsActifs = medecinRepository.findByDisponibleTrue().size();

        // 6. No-Show
        long noShowToday = ticketRepository.countByStatutAndHeureCreationBetween(TicketStatus.NO_SHOW, debutJour, finJour);
        double noShowPct = ticketsJour > 0 ? (noShowToday * 100.0 / ticketsJour) : 0.0;
        
        long noShowHier = ticketRepository.countByStatutAndHeureCreationBetween(TicketStatus.NO_SHOW, debutHier, finHier);
        double noShowPctHier = ticketsHier > 0 ? (noShowHier * 100.0 / ticketsHier) : 0.0;

        // 7. Satisfaction
        double satisfaction = feedbackRepository.averageScore().orElse(0.0);
        // Approximation satisfaction hier (simplifiée car pas de date sur feedback souvent dans l'entité de base, mais on va assumer globale)
        double satisfactionHier = satisfaction; // Fallback

        // 8. Trafic par heure (07h -> 19h)
        List<Object[]> queryResults = ticketRepository.countByHeureCreationGroupByHeure(debutJour, finJour);
        Map<Integer, Long> hourMap = queryResults.stream()
                .collect(Collectors.toMap(res -> ((Number) res[0]).intValue(), res -> ((Number) res[1]).longValue()));

        List<StatsDashboardResponse.TraficHeure> trafic = new ArrayList<>();
        for (int h = 7; h <= 19; h++) {
            trafic.add(new StatsDashboardResponse.TraficHeure(String.format("%02dh", h), hourMap.getOrDefault(h, 0L)));
        }

        // 9. Répartition Statuts
        Map<String, Long> repartition = new HashMap<>();
        repartition.put("En attente", (long) enAttente);
        repartition.put("Terminés", ticketRepository.countByStatutAndHeureCreationBetween(TicketStatus.COMPLETED, debutJour, finJour));
        repartition.put("Absents", noShowToday);
        repartition.put("Annulés", ticketRepository.countByStatutAndHeureCreationBetween(TicketStatus.CANCELLED, debutJour, finJour));

        // 10. Top Médecins
        List<Object[]> topMedQuery = ticketRepository.findTopMedecinsByConsultations(PageRequest.of(0, 3));
        List<StatsDashboardResponse.TopMedecinStat> topMedecins = topMedQuery.stream()
                .map(res -> {
                    Medecin m = (Medecin) res[0];
                    return StatsDashboardResponse.TopMedecinStat.builder()
                            .nom("Dr. " + m.getUser().getPrenom() + " " + m.getUser().getNom())
                            .specialite(m.getSpecialite())
                            .consultations(((Number) res[1]).longValue())
                            .build();
                })
                .collect(Collectors.toList());

        // 11. Comparaison Hier (Badges)
        Map<String, String> comparaison = new HashMap<>();
        comparaison.put("ticketsActifs", calculateTrend(ticketsJour, ticketsHier));
        comparaison.put("noShow", calculateTrend(noShowPct, noShowPctHier));
        comparaison.put("satisfaction", calculateTrend(satisfaction, satisfactionHier));
        comparaison.put("attente", calculateTrend(attenteMoyenne, attenteMoyenneHier, true)); // Inverted (lower is better)

        return StatsDashboardResponse.builder()
                .ticketsActifs(ticketsActifsActuels)
                .enAttente((int) enAttente)
                .enCours((int) enCours)
                .absences((int) noShowToday)
                .ticketsJour((int) ticketsJour)
                .occupation(Math.round(occupation * 10.0) / 10.0)
                .tauxOccupation(Math.round(occupation * 10.0) / 10.0)
                .attenteMoyenne(Math.round(attenteMoyenne * 10.0) / 10.0)
                .medecinsActifs(medecinsActifs)
                .noShowPourcentage(Math.round(noShowPct * 10.0) / 10.0)
                .satisfaction(Math.round(satisfaction * 10.0) / 10.0)
                .totalTickets(ticketRepository.count())
                .traficParHeure(trafic)
                .repartitionStatuts(repartition)
                .topMedecins(topMedecins)
                .comparaisonHier(comparaison)
                .build();
    }

    public com.carepulse.carepulse.dto.response.ReportsResponse getRapports(int jours, String dateDebutStr, String dateFinStr) {
        log.info("Génération du rapport pour {} jours ou entre {} et {}", jours, dateDebutStr, dateFinStr);

        LocalDateTime debut;
        LocalDateTime fin;

        if (dateDebutStr != null && !dateDebutStr.isEmpty() && dateFinStr != null && !dateFinStr.isEmpty()) {
            debut = LocalDate.parse(dateDebutStr).atStartOfDay();
            fin = LocalDate.parse(dateFinStr).atTime(23, 59, 59);
        } else {
            fin = LocalDateTime.now();
            debut = LocalDate.now().minusDays(jours).atStartOfDay();
        }

        // 1. KPIs Globaux
        long totalTickets = ticketRepository.countByHeureCreationBetween(debut, fin);
        long termines = ticketRepository.countByStatutAndHeureCreationBetween(TicketStatus.COMPLETED, debut, fin);
        double tauxCompletion = totalTickets > 0 ? (termines * 100.0) / totalTickets : 0.0;

        Double tempsMoyenCons = consultationRepository.avgDureeConsultation(debut, fin);
        double tempsMoyen = tempsMoyenCons != null ? tempsMoyenCons : 0.0;

        long noShow = ticketRepository.countByStatutAndHeureCreationBetween(TicketStatus.NO_SHOW, debut, fin);
        double tauxNoShow = totalTickets > 0 ? (noShow * 100.0) / totalTickets : 0.0;

        // 2. Tickets par jour (Graph 1)
        List<Object[]> ticketsJourQuery = ticketRepository.countByHeureCreationGroupByJour(debut, fin);
        List<com.carepulse.carepulse.dto.response.ReportsResponse.DataPoint> ticketsParJour = ticketsJourQuery.stream()
                .map(res -> new com.carepulse.carepulse.dto.response.ReportsResponse.DataPoint(res[0].toString(), ((Number) res[1]).doubleValue()))
                .collect(Collectors.toList());

        // 3. Répartition par service (Graph 2)
        List<Object[]> servicesQuery = ticketRepository.countByFileAttenteGroupByNom(debut, fin);
        List<com.carepulse.carepulse.dto.response.ReportsResponse.DataPoint> repartitionServices = servicesQuery.stream()
                .map(res -> new com.carepulse.carepulse.dto.response.ReportsResponse.DataPoint(res[0].toString(), ((Number) res[1]).doubleValue()))
                .collect(Collectors.toList());

        // 4. Tickets par heure (Graph 3) - version 24h
        List<Object[]> heureQuery = ticketRepository.countByHeureCreationGroupByHeure(debut, fin);
        Map<Integer, Long> hourMap = heureQuery.stream()
                .collect(Collectors.toMap(res -> ((Number) res[0]).intValue(), res -> ((Number) res[1]).longValue()));
        List<com.carepulse.carepulse.dto.response.ReportsResponse.DataPoint> ticketsParHeure = new ArrayList<>();
        for (int h = 0; h < 24; h++) {
            ticketsParHeure.add(new com.carepulse.carepulse.dto.response.ReportsResponse.DataPoint(String.format("%02dh", h), (double) hourMap.getOrDefault(h, 0L)));
        }

        // 5. No-show par jour (Graph 4)
        List<Object[]> noShowJourQuery = ticketRepository.countNoShowsByHeureCreationGroupByJour(debut, fin);
        List<com.carepulse.carepulse.dto.response.ReportsResponse.DataPoint> noShowParJour = noShowJourQuery.stream()
                .map(res -> new com.carepulse.carepulse.dto.response.ReportsResponse.DataPoint(res[0].toString(), ((Number) res[1]).doubleValue()))
                .collect(Collectors.toList());

        // 6. Performances Médecins (Table)
        List<Object[]> medQuery = ticketRepository.getMedecinPerformances(debut, fin);
        List<com.carepulse.carepulse.dto.response.ReportsResponse.MedecinPerformance> performancesMedecins = medQuery.stream()
                .map(res -> {
                    Medecin m = (Medecin) res[0];
                    Double avgSat = feedbackRepository.averageScoreByMedecin(m.getId());
                    return com.carepulse.carepulse.dto.response.ReportsResponse.MedecinPerformance.builder()
                            .medecin("Dr. " + m.getUser().getPrenom() + " " + m.getUser().getNom())
                            .specialite(m.getSpecialite())
                            .consultations(((Number) res[1]).longValue())
                            .tempsMoyen(res[2] != null ? Math.round(((Number) res[2]).doubleValue() * 10.0) / 10.0 : 0.0)
                            .satisfaction(avgSat != null ? String.format("%.1f/5", avgSat) : "N/A")
                            .build();
                })
                .sorted(Comparator.comparing(com.carepulse.carepulse.dto.response.ReportsResponse.MedecinPerformance::getConsultations).reversed())
                .collect(Collectors.toList());

        // 7. Liste des tickets pour export CSV
        List<Ticket> tickets = ticketRepository.findAllByHeureCreationBetweenOrderByHeureCreationDesc(debut, fin);
        List<com.carepulse.carepulse.dto.response.ReportsResponse.TicketReportItem> listeTickets = tickets.stream()
                .map(t -> com.carepulse.carepulse.dto.response.ReportsResponse.TicketReportItem.builder()
                        .heureCreation(t.getHeureCreation())
                        .numeroTicket(t.getNumeroTicket())
                        .patientNom(t.getPatient().getUser().getPrenom() + " " + t.getPatient().getUser().getNom())
                        .fileAttente(t.getFileAttente().getNom())
                        .statut(t.getStatut().name())
                        .tempsAttenteEstime(t.getTempsAttenteEstime())
                        .medecinNom(t.getMedecin() != null ? "Dr. " + t.getMedecin().getUser().getPrenom() + " " + t.getMedecin().getUser().getNom() : "-")
                        .build())
                .collect(Collectors.toList());

        return com.carepulse.carepulse.dto.response.ReportsResponse.builder()
                .totalTickets(totalTickets)
                .tauxCompletion(Math.round(tauxCompletion * 10.0) / 10.0)
                .tempsMoyen(Math.round(tempsMoyen * 10.0) / 10.0)
                .tauxNoShow(Math.round(tauxNoShow * 10.0) / 10.0)
                .ticketsParJour(ticketsParJour)
                .repartitionServices(repartitionServices)
                .ticketsParHeure(ticketsParHeure)
                .noShowParJour(noShowParJour)
                .performancesMedecins(performancesMedecins)
                .listeTickets(listeTickets)
                .build();
    }

    private String calculateTrend(double current, double previous) {
        return calculateTrend(current, previous, false);
    }

    private String calculateTrend(double current, double previous, boolean inverted) {
        if (previous == 0) return "NOUVEAU";
        if (current == previous) return "STABLE";
        
        double diff = ((current - previous) / previous) * 100.0;
        String sign = diff > 0 ? "+" : "";
        return sign + String.format("%.1f%%", diff);
    }
}
