package com.carepulse.carepulse.service;

import com.carepulse.carepulse.dto.response.NotificationDTO;
import com.carepulse.carepulse.entity.Notification;
import com.carepulse.carepulse.entity.User;
import com.carepulse.carepulse.enums.NotificationType;
import com.carepulse.carepulse.exception.ResourceNotFoundException;
import com.carepulse.carepulse.repository.NotificationRepository;
import com.carepulse.carepulse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationService {
    
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public void envoyerNotification(Long userId, String titre, String message, NotificationType type, Long ticketId) {
        log.info("Envoi d'une notification à l'utilisateur {} : {}", userId, titre);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        // 1. Sauvegarder en base
        Notification notification = Notification.builder()
            .user(user)
            .titre(titre)
            .contenu(message)
            .type(type)
            .lue(false)
            .dateCreation(LocalDateTime.now())
            .ticketId(ticketId)
            .build();
        notificationRepository.save(notification);
        
        // 2. Envoyer via WebSocket
        NotificationDTO dto = NotificationDTO.builder()
            .id(notification.getId())
            .titre(titre)
            .message(message)
            .type(type)
            .dateCreation(notification.getDateCreation())
            .ticketId(ticketId)
            .build();
            
        messagingTemplate.convertAndSendToUser(
            userId.toString(),
            "/queue/notifications",
            dto
        );
    }

    public List<Notification> getNotificationsPourUtilisateur(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));
        return notificationRepository.findTop20ByUserOrderByDateCreationDesc(user);
    }

    @Transactional
    public void marquerCommeLue(Long notificationId) {
        Notification notif = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification non trouvée"));
        notif.setLue(true);
        notificationRepository.save(notif);
    }

    @Transactional
    public void marquerToutCommeLu(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));
        List<Notification> nonLues = notificationRepository.findByUserAndLueFalse(user);
        nonLues.forEach(n -> n.setLue(true));
        notificationRepository.saveAll(nonLues);
    }

    @Transactional
    public void supprimerNotification(Long notificationId) {
        if (!notificationRepository.existsById(notificationId)) {
            throw new ResourceNotFoundException("Notification non trouvée");
        }
        notificationRepository.deleteById(notificationId);
    }
}
