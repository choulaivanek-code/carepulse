package com.carepulse.carepulse.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ParametreSystemeRequest {
    @NotBlank(message = "La clé est obligatoire")
    private String cle;
    @NotBlank(message = "La valeur est obligatoire")
    private String valeur;
    private String description;
}
