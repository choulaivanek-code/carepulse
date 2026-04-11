package com.carepulse.carepulse.service;

import com.carepulse.carepulse.dto.request.CreateMessageRequest;
import com.carepulse.carepulse.dto.response.MessageResponse;
import com.carepulse.carepulse.entity.*;
import com.carepulse.carepulse.enums.MessageStatus;
import com.carepulse.carepulse.exception.CarePulseException;
import com.carepulse.carepulse.exception.ResourceNotFoundException;
import com.carepulse.carepulse.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;
    private final AgentRepository agentRepository;
    private final NotificationService notificationService;

    @Transactional
    public MessageResponse envoyerMessage(CreateMessageRequest request, String userEmail) {
        log.info("Envoi d'un message par l'utilisateur {}", userEmail);
        
        Ticket ticket = ticketRepository.findById(request.getTicketId())
                .orElseThrow(() -> new ResourceNotFoundException("Ticket non trouvé"));
        
        User expediteur = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Expéditeur non trouvé"));
        
        // Trouver ou créer la conversation
        Conversation conversation = conversationRepository
                .findByTicket(ticket)
                .stream().findFirst()
                .orElseGet(() -> {
                    // Logique destinataire
                    User destinataire;
                    if (ticket.getMedecin() != null) {
                        destinataire = ticket.getMedecin().getUser();
                    } else {
                        // Fallback : premier agent disponible
                        destinataire = agentRepository.findByDisponibleTrue().stream()
                            .findFirst()
                            .map(Agent::getUser)
                            .orElseThrow(() -> new CarePulseException(
                                "La messagerie n'est pas disponible pour le moment", 
                                HttpStatus.SERVICE_UNAVAILABLE
                            ));
                    }

                    Conversation c = Conversation.builder()
                            .ticket(ticket)
                            .expediteur(expediteur)
                            .destinataire(destinataire)
                            .sujet("Conversation sur le ticket " + ticket.getNumeroTicket())
                            .actif(true)
                            .build();
                    return conversationRepository.save(c);
                });

        Message message = Message.builder()
                .conversation(conversation)
                .expediteur(expediteur)
                .contenu(request.getContenu())
                .statut(MessageStatus.ENVOYE)
                .dateEnvoi(LocalDateTime.now())
                .build();

        MessageResponse response = mapToResponse(messageRepository.save(message));

        // Notification destinataire
        notificationService.envoyerNotification(
            conversation.getDestinataire().getId().equals(expediteur.getId()) ? 
                conversation.getExpediteur().getId() : conversation.getDestinataire().getId(),
            "Nouveau message",
            expediteur.getPrenom() + " : " + request.getContenu().substring(0, Math.min(50, request.getContenu().length())),
            com.carepulse.carepulse.enums.NotificationType.NOUVEAU_MESSAGE,
            ticket.getId()
        );

        return response;
    }

    public List<Message> getMessagesByConversation(Long conversationId) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation non trouvée"));
        return messageRepository.findByConversation(conv);
    }

    public List<Message> getMessagesByTicketId(Long ticketId) {
        List<Conversation> conversations = conversationRepository.findByTicketId(ticketId);
        if (conversations.isEmpty()) {
            return new ArrayList<>();
        }
        return messageRepository.findByConversation(conversations.get(0));
    }

    @Transactional
    public void marquerCommeLu(Long conversationId, Long userId) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation non trouvée"));
        
        List<Message> messages = messageRepository.findByConversation(conv);
        for (Message m : messages) {
            if (!m.getExpediteur().getId().equals(userId) && m.getStatut() != MessageStatus.LU) {
                m.setStatut(MessageStatus.LU);
                m.setDateLecture(LocalDateTime.now());
                messageRepository.save(m);
            }
        }
    }

    private MessageResponse mapToResponse(Message m) {
        return MessageResponse.builder()
                .id(m.getId())
                .contenu(m.getContenu())
                .expediteurId(m.getExpediteur().getId())
                .expediteurNom(m.getExpediteur().getPrenom() + " " + m.getExpediteur().getNom())
                .statut(m.getStatut())
                .dateEnvoi(m.getDateEnvoi())
                .build();
    }
}
