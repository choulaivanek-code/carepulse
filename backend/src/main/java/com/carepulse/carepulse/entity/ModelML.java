package com.carepulse.carepulse.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "modeles_ml")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModelML {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    private String version;

    @Column(name = "type_modele")
    private String typeModele;

    @Column(name = "chemin_fichier")
    private String cheminFichier;

    @Column(name = "precision_entrainement")
    private double precisionEntrainement;

    @Builder.Default
    private boolean actif = true;

    @Column(name = "date_dernier_entrainement")
    private LocalDateTime dateDernierEntrainement;
}
