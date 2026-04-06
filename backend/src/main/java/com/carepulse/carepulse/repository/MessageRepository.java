package com.carepulse.carepulse.repository;

import com.carepulse.carepulse.entity.Conversation;
import com.carepulse.carepulse.entity.Message;
import com.carepulse.carepulse.entity.User;
import com.carepulse.carepulse.enums.MessageStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByConversation(Conversation conversation);
    long countByStatutAndConversationDestinataire(MessageStatus statut, User destinataire);
}
