package com.carepulse.carepulse.websocket;

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
public class NotificationMessage {
    private Long userId;
    private NotificationType type;
    private String titre;
    private String contenu;
    private Long ticketId;
    private LocalDateTime timestamp;
}
