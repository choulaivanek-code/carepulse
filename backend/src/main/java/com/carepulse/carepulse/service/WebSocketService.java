package com.carepulse.carepulse.service;

import com.carepulse.carepulse.websocket.NotificationMessage;
import com.carepulse.carepulse.websocket.OverloadAlertMessage;
import com.carepulse.carepulse.websocket.QueueUpdateMessage;
import com.carepulse.carepulse.websocket.TicketUpdateMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class WebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    public void sendQueueUpdate(Long fileAttenteId, int nombreEnAttente, int tempsAttenteMoyen) {
        log.info("WebSocket: Envoi mise à jour file d'attente {}", fileAttenteId);
        QueueUpdateMessage message = QueueUpdateMessage.builder()
                .fileAttenteId(fileAttenteId)
                .nombreEnAttente(nombreEnAttente)
                .tempsAttenteMoyen(tempsAttenteMoyen)
                .timestamp(LocalDateTime.now())
                .build();
        messagingTemplate.convertAndSend("/topic/queue/" + fileAttenteId, message);
    }

    public void sendTicketUpdate(Long ticketId, String statut, int position, int tempsEstime, String text) {
        log.info("WebSocket: Envoi mise à jour ticket {}", ticketId);
        TicketUpdateMessage message = TicketUpdateMessage.builder()
                .ticketId(ticketId)
                .positionActuelle(position)
                .tempsAttenteEstime(tempsEstime)
                .message(text)
                .timestamp(LocalDateTime.now())
                .build();
        messagingTemplate.convertAndSend("/topic/ticket/" + ticketId, message);
    }

    public void sendNotificationToUser(Long userId, NotificationMessage message) {
        log.info("WebSocket: Envoi notification à l'utilisateur {}", userId);
        messagingTemplate.convertAndSendToUser(userId.toString(), "/queue/notifications", message);
    }

    public void sendOverloadAlert(String niveau, int nombreTickets, String text) {
        log.warn("WebSocket: Envoi alerte surcharge - Niveau: {}", niveau);
        OverloadAlertMessage message = OverloadAlertMessage.builder()
                .niveau(niveau)
                .nombreTickets(nombreTickets)
                .message(text)
                .timestamp(LocalDateTime.now())
                .build();
        messagingTemplate.convertAndSend("/topic/alerts/overload", message);
    }
}
