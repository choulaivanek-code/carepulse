package com.carepulse.carepulse.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "feedbacks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "note_globale", nullable = false)
    private int noteGlobale;

    @Column(name = "note_attente_temps")
    private int noteAttenteTemps;

    @Column(name = "note_accueil")
    private int noteAccueil;

    @Column(name = "note_medecin")
    private int noteMedecin;

    @Column(name = "note_proprete")
    private int noteProprete;

    @Column(columnDefinition = "TEXT")
    private String commentaire;

    @Column(name = "points_positifs", columnDefinition = "TEXT")
    private String pointsPositifs;

    @Column(name = "axes_amelioration", columnDefinition = "TEXT")
    private String axesAmelioration;

    @Builder.Default
    private boolean recommande = true;

    @Builder.Default
    private boolean anonyme = false;

    @Builder.Default
    private boolean modere = false;

    @Column(name = "date_creation")
    private LocalDateTime dateCreation;

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
    }
}
