package com.carepulse.carepulse.repository;

import com.carepulse.carepulse.entity.Conversation;
import com.carepulse.carepulse.entity.Ticket;
import com.carepulse.carepulse.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    List<Conversation> findByTicket(Ticket ticket);
    List<Conversation> findByTicketId(Long ticketId);
    List<Conversation> findByExpediteurOrDestinataire(User expediteur, User destinataire);
}
