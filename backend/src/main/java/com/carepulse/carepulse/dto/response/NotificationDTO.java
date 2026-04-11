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
public class NotificationDTO {
    private Long id;
    private String titre;
    private String message;
    private NotificationType type;
    private LocalDateTime dateCreation;
    private Long ticketId;
}
