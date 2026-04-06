package com.carepulse.carepulse.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "parametres_systeme")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParametreSysteme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String cle;

    @Column(nullable = false)
    private String valeur;

    private String description;

    @Column(name = "date_modification")
    private LocalDateTime dateModification;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        dateModification = LocalDateTime.now();
    }
}
