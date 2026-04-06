package com.carepulse.carepulse.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedecinResponse {
    private Long id;
    private String nom;
    private String prenom;
    private String specialite;
    private String joursTravail;
    private LocalTime heureDebut;
    private LocalTime heureFin;
    private boolean disponible;
    private String fileAttenteNom;
}
