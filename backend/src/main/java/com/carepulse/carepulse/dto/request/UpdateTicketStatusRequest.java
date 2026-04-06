package com.carepulse.carepulse.dto.request;

import com.carepulse.carepulse.enums.TicketStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateTicketStatusRequest {
    @NotNull(message = "Le statut est obligatoire")
    private TicketStatus statut;
    
    private String justification;
}
