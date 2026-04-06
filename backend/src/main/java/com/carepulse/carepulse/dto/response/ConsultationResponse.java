package com.carepulse.carepulse.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationResponse {
    private Long id;
    private String symptomes;
    private String diagnostic;
    private String traitement;
    private String examens;
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
    private int dureeReelle;
    private String medecinNom;
    private String patientNom;
}
