package com.carepulse.carepulse.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateMessageRequest {
    private Long conversationId;

    private Long ticketId;

    @NotBlank(message = "Le contenu est obligatoire")
    private String contenu;
}
