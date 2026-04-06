package com.carepulse.carepulse.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatsDashboardResponse {
    // Legacy fields kept for backwards compat
    private int ticketsActifs;
    private int ticketsAujourdhui;
    private double tauxOccupation;
    private double tempsAttenteMoyen;
    private int medecinsDisponibles;
    private double tauxNoShow;
    private double tauxSatisfaction;

    // Agent KPI fields — exact DB values
    private long enAttente;
    private long enCours;
    private long absences;
    private double satisfaction;
}

