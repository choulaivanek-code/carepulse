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
public class OverloadAlertMessage {
    private String niveau;
    private int nombreTickets;
    private String message;
    private LocalDateTime timestamp;
}
