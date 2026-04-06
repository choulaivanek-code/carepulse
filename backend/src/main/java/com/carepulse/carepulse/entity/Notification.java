package com.carepulse.carepulse.entity;

import com.carepulse.carepulse.enums.NotificationType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(nullable = false)
    private String titre;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String contenu;

    @Builder.Default
    private boolean lue = false;

    @Column(name = "date_creation")
    private LocalDateTime dateCreation;

    @Column(name = "ticket_id")
    private Long ticketId;

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
    }
}
