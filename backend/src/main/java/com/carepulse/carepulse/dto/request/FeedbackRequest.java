package com.carepulse.carepulse.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FeedbackRequest {
    @NotNull(message = "Le ticket est obligatoire")
    private Long ticketId;

    @Min(1) @Max(5)
    private int noteGlobale;

    @Min(1) @Max(5)
    private int noteAttenteTemps;

    @Min(1) @Max(5)
    private int noteAccueil;

    @Min(1) @Max(5)
    private int noteMedecin;

    @Min(1) @Max(5)
    private int noteProprete;

    private String commentaire;
    private String pointsPositifs;
    private String axesAmelioration;
    private boolean recommande;
    private boolean anonyme;
}
