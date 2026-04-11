package com.carepulse.carepulse.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "medecins")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medecin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String specialite;

    @Column(name = "numero_ordre", nullable = false, unique = true)
    private String numeroOrdre;

    @Column(name = "temps_consultation_moyen")
    @Builder.Default
    private int tempsConsultationMoyen = 15;

    @Column(nullable = false)
    @Builder.Default
    private Boolean disponible = true;

    private String joursTravail;
    private LocalTime heureDebut;
    private LocalTime heureFin;

    @ManyToOne
    @JoinColumn(name = "file_attente_id")
    private FileAttente fileAttente;

    @OneToMany(mappedBy = "medecin")
    @JsonIgnore
    private List<Ticket> tickets = new ArrayList<>();
}
