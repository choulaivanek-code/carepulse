package com.carepulse.carepulse.dto.request;

import com.carepulse.carepulse.enums.ConsultationType;
import com.carepulse.carepulse.enums.PriorityType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateTicketRequest {
    @NotNull(message = "La file d'attente est obligatoire")
    private Long fileAttenteId;

    @NotBlank(message = "Le motif est obligatoire")
    private String motif;

    private boolean estUrgence;
    private String justificationUrgence;

    @NotNull(message = "Le type de consultation est obligatoire")
    private ConsultationType consultationType;

    private PriorityType priorite;

    private Long patientId;
}
