package com.carepulse.carepulse.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatsDashboardResponse {
    private int ticketsActifs;
    private int ticketsJour;
    private double occupation;
    private double attenteMoyenne;
    private int medecinsActifs;
    private double noShowPourcentage;
    private double satisfaction;
    private long totalTickets;

    private List<TraficHeure> traficParHeure;
    private Map<String, Long> repartitionStatuts;
    private List<TopMedecinStat> topMedecins;
    private Map<String, String> comparaisonHier;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TraficHeure {
        private String heure;
        private long count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopMedecinStat {
        private String nom;
        private String specialite;
        private long consultations;
    }
}
