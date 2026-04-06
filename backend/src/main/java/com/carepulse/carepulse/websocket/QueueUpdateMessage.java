package com.carepulse.carepulse.websocket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QueueUpdateMessage {
    private Long fileAttenteId;
    private int nombreEnAttente;
    private int tempsAttenteMoyen;
    private LocalDateTime timestamp;
}
