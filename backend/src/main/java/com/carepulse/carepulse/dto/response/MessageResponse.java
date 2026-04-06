package com.carepulse.carepulse.dto.response;

import com.carepulse.carepulse.enums.MessageStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {
    private Long id;
    private String contenu;
    private String expediteurNom;
    private MessageStatus statut;
    private LocalDateTime dateEnvoi;
}
