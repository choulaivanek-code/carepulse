package com.carepulse.carepulse.service;

import com.carepulse.carepulse.entity.Notification;
import com.carepulse.carepulse.entity.User;
import com.carepulse.carepulse.enums.NotificationType;
import com.carepulse.carepulse.exception.ResourceNotFoundException;
import com.carepulse.carepulse.repository.NotificationRepository;
import com.carepulse.carepulse.repository.UserRepository;
import com.carepulse.carepulse.websocket.NotificationMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final WebSocketService webSocketService;

    @Transactional
    public void creerNotification(Long userId, NotificationType type, String titre, String contenu, Long ticketId) {
        log.info("Création d'une notification pour l'utilisateur {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        Notification notif = Notification.builder()
                .user(user)
                .type(type)
                .titre(titre)
                .contenu(contenu)
                .ticketId(ticketId)
                .lue(false)
                .dateCreation(LocalDateTime.now())
                .build();

        notificationRepository.save(notif);

        // Envoi via WebSocket
        NotificationMessage wsMessage = NotificationMessage.builder()
                .userId(userId)
                .type(type)
                .titre(titre)
                .contenu(contenu)
                .ticketId(ticketId)
                .timestamp(LocalDateTime.now())
                .build();
        
        webSocketService.sendNotificationToUser(userId, wsMessage);
    }

    public List<Notification> getNotificationsNonLues(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));
        return notificationRepository.findByUserAndLueFalse(user);
    }

    @Transactional
    public void marquerCommeLue(Long notificationId) {
        Notification notif = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification non trouvée"));
        notif.setLue(true);
        notificationRepository.save(notif);
    }
}
