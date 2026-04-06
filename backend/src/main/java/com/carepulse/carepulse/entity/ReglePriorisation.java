package com.carepulse.carepulse.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "regles_priorisation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReglePriorisation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    private String description;

    @Column(nullable = false)
    private String critere;

    @Column(name = "valeur_seuil")
    private double valeurSeuil;

    @Column(name = "score_ajoute")
    private int scoreAjoute;

    @Builder.Default
    private boolean actif = true;

    @Column(name = "ordre_application")
    private int ordreApplication;
}
