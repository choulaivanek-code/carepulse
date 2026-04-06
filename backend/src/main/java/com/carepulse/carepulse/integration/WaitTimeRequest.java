package com.carepulse.carepulse.integration;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WaitTimeRequest {
    private int nombreTicketsEnAttente;
    private int heureJournee;
    private int jourSemaine;
    private int medecinDisponibles;
    private double dureeConsultationMoyenne;
}
