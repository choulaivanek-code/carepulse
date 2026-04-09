package com.carepulse.carepulse.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateRequest {
    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    private String prenom;

    private String telephone;

    private String specialite;
    
    private String numeroOrdre;
    
    private String joursTravail;
    
    private String heureDebut;
    
    private String heureFin;
    
    private Long fileAttenteId;

    private String poste;

    private boolean active;
    
    private boolean disponible;
}
