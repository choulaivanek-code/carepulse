package com.carepulse.carepulse.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReglePriorisationRequest {
    @NotBlank(message = "Le nom est obligatoire")
    private String nom;
    private String description;
    @NotBlank(message = "Le critère est obligatoire")
    private String critere;
    private double valeurSeuil;
    private int scoreAjoute;
    private Boolean actif;
    private int ordreApplication;
}
