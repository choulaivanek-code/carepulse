package com.carepulse.carepulse.entity;

import com.carepulse.carepulse.enums.MessageStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expediteur_id", nullable = false)
    private User expediteur;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String contenu;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MessageStatus statut;

    @Column(name = "date_envoi")
    private LocalDateTime dateEnvoi;

    @Column(name = "date_lecture")
    private LocalDateTime dateLecture;

    @PrePersist
    protected void onCreate() {
        dateEnvoi = LocalDateTime.now();
        if (statut == null) statut = MessageStatus.ENVOYE;
    }
}
