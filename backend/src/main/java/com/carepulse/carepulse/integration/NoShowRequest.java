package com.carepulse.carepulse.integration;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoShowRequest {
    private double scoreFiabilitePatient;
    private int nombreNoShowsHistorique;
    private int heureCreationTicket;
    private boolean estUrgence;
    private double distanceCliniqueKm;
}
