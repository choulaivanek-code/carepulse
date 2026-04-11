package com.carepulse.carepulse.entity;

import com.carepulse.carepulse.enums.PriorityType;
import com.carepulse.carepulse.enums.TicketStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_attente_id", nullable = false)
    private FileAttente fileAttente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medecin_id")
    private Medecin medecin;

    @Column(name = "numero_ticket", nullable = false, unique = true)
    private String numeroTicket;

    @Column(nullable = false)
    private TicketStatus statut;

    @Column(nullable = false)
    private PriorityType priorite;

    @Column(name = "score_total")
    private int scoreTotal;

    private String motif;

    @Column(name = "est_urgence")
    @Builder.Default
    private Boolean estUrgence = false;

    @Column(name = "justification_urgence")
    private String justificationUrgence;

    @Column(name = "heure_creation")
    private LocalDateTime heureCreation;

    @Column(name = "heure_appel")
    private LocalDateTime heureAppel;

    @Column(name = "heure_debut")
    private LocalDateTime heureDebut;

    @Column(name = "heure_fin")
    private LocalDateTime heureFin;

    @Column(name = "temps_attente_estime")
    private int tempsAttenteEstime;

    @Column(name = "score_no_show")
    private double scoreNoShow;

    @Column(name = "position_actuelle")
    private int positionActuelle;

    @Column(name = "est_present")
    @Builder.Default
    private Boolean estPresent = false;

    @PrePersist
    protected void onCreate() {
        heureCreation = LocalDateTime.now();
        if (statut == null) statut = TicketStatus.WAITING;
    }
}
