package com.carepulse.carepulse.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cliniques")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Clinique {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    private String adresse;
    private String telephone;
    private String email;

    @Column(name = "capacite_max")
    private int capaciteMax;

    @Column(name = "heure_ouverture")
    private LocalTime heureOuverture;

    @Column(name = "heure_fermeture")
    private LocalTime heureFermeture;

    @Builder.Default
    @Column(name = "en_service")
    private Boolean enService = true;

    @OneToMany(mappedBy = "clinique")
    @JsonIgnore
    private List<FileAttente> filesAttente = new ArrayList<>();
}
