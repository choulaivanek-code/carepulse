package com.carepulse.carepulse.service;

import com.carepulse.carepulse.dto.request.CreateMessageRequest;
import com.carepulse.carepulse.entity.Conversation;
import com.carepulse.carepulse.entity.Message;
import com.carepulse.carepulse.entity.Ticket;
import com.carepulse.carepulse.entity.User;
import com.carepulse.carepulse.enums.MessageStatus;
import com.carepulse.carepulse.exception.ResourceNotFoundException;
import com.carepulse.carepulse.repository.ConversationRepository;
import com.carepulse.carepulse.repository.MessageRepository;
import com.carepulse.carepulse.repository.TicketRepository;
import com.carepulse.carepulse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    @Transactional
    public Message envoyerMessage(CreateMessageRequest request, Long expediteurId) {
        log.info("Envoi d'un message par l'utilisateur {}", expediteurId);
        
        Conversation conv = null;
        
        // 1. Try finding conversation by ID if provided
        if (request.getConversationId() != null) {
            conv = conversationRepository.findById(request.getConversationId()).orElse(null);
        }
        
        // 2. If not found or not provided, try finding by ticketId
        if (conv == null && request.getTicketId() != null) {
            List<Conversation> existingConvs = conversationRepository.findByTicketId(request.getTicketId());
            if (!existingConvs.isEmpty()) {
                conv = existingConvs.get(0);
            } else {
                // Create a new conversation for this ticket
                Ticket ticket = ticketRepository.findById(request.getTicketId())
                        .orElseThrow(() -> new ResourceNotFoundException("Ticket non trouvé"));
                
                User expediteur = userRepository.findById(expediteurId)
                        .orElseThrow(() -> new ResourceNotFoundException("Expéditeur non trouvé"));
                
                User destinataire;
                if (expediteur.getId().equals(ticket.getPatient().getUser().getId())) {
                    // Patient -> Medecin (or fallback to staff if no medecin assigned)
                    if (ticket.getMedecin() != null) {
                        destinataire = ticket.getMedecin().getUser();
                    } else {
                        // For now, if no medecin is assigned, we might need a fallback logic or throw a clear error
                        // but the prompt says "en créer une nouvelle automatiquement avec l'expéditeur et le destinataire"
                        // If it's a patient, and no medecin is assigned, who is the recipient?
                        // Usually an agent/admin. I'll throw a clear error if no recipient can be determined.
                        throw new ResourceNotFoundException("Aucun médecin n'est encore assigné à ce ticket.");
                    }
                } else {
                    // Staff -> Patient
                    destinataire = ticket.getPatient().getUser();
                }

                conv = Conversation.builder()
                        .ticket(ticket)
                        .expediteur(expediteur)
                        .destinataire(destinataire)
                        .sujet("Conversation sur le ticket " + ticket.getNumeroTicket())
                        .actif(true)
                        .build();
                conv = conversationRepository.save(conv);
            }
        }
        
        if (conv == null) {
            throw new ResourceNotFoundException("Impossible de déterminer la conversation (conversationId ou ticketId invalide ou manquant)");
        }
        
        User expediteur = userRepository.findById(expediteurId)
                .orElseThrow(() -> new ResourceNotFoundException("Expéditeur non trouvé"));

        Message message = Message.builder()
                .conversation(conv)
                .expediteur(expediteur)
                .contenu(request.getContenu())
                .statut(MessageStatus.ENVOYE)
                .dateEnvoi(LocalDateTime.now())
                .build();

        return messageRepository.save(message);
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
}
