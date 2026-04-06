package com.carepulse.carepulse.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedecinCreateRequest {
    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format d'email invalide")
    private String email;

    private String password;

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    private String prenom;

    private String telephone;

    @NotBlank(message = "La spécialité est obligatoire")
    private String specialite;

    @NotBlank(message = "Le numéro d'ordre est obligatoire")
    private String numeroOrdre;

    private Long fileAttenteId;
    private String joursTravail;
    private LocalTime heureDebut;
    private LocalTime heureFin;
    private boolean disponible = true;
}
