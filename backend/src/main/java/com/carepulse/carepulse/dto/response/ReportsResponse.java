package com.carepulse.carepulse.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportsResponse {
    private long totalTickets;
    private double tauxCompletion;
    private double tempsMoyen;
    private double tauxNoShow;
    
    private List<DataPoint> ticketsParJour;
    private List<DataPoint> repartitionServices;
    private List<DataPoint> ticketsParHeure;
    private List<DataPoint> noShowParJour;
    private List<MedecinPerformance> performancesMedecins;
    private List<TicketReportItem> listeTickets;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DataPoint {
        private String label;
        private Double value;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MedecinPerformance {
        private String medecin;
        private String specialite;
        private long consultations;
        private double tempsMoyen;
        private String satisfaction; // "N/A" or "X.X/5"
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TicketReportItem {
        private LocalDateTime heureCreation;
        private String numeroTicket;
        private String patientNom;
        private String fileAttente;
        private String statut;
        private int tempsAttenteEstime;
        private String medecinNom;
    }
}
