package com.carepulse.carepulse.websocket;

import com.carepulse.carepulse.enums.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketUpdateMessage {
    private Long ticketId;
    private TicketStatus statut;
    private int positionActuelle;
    private int tempsAttenteEstime;
    private String message;
    private LocalDateTime timestamp;
}
