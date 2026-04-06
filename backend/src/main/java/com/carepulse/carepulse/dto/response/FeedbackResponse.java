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
public class FeedbackResponse {
    private Long id;
    private int noteGlobale;
    private int noteAttenteTemps;
    private int noteAccueil;
    private int noteMedecin;
    private int noteProprete;
    private String commentaire;
    private boolean recommande;
    private boolean anonyme;
    private boolean modere;
    private LocalDateTime dateCreation;
}
