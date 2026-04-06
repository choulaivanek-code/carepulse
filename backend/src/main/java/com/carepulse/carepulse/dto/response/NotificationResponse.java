package com.carepulse.carepulse.dto.response;

import com.carepulse.carepulse.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private NotificationType type;
    private String titre;
    private String contenu;
    private boolean lue;
    private LocalDateTime dateCreation;
    private Long ticketId;
}
