package com.carepulse.carepulse.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "patients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "date_naissance")
    private LocalDate dateNaissance;

    @Column(name = "numero_securite_sociale")
    private String numeroSecuriteSociale;

    @Column(name = "est_enceinte")
    @Builder.Default
    private Boolean estEnceinte = false;

    @Column(name = "a_handicap")
    @Builder.Default
    private Boolean aHandicap = false;

    @Column(name = "score_fiabilite")
    @Builder.Default
    private double scoreFiabilite = 1.0;

    @Column(name = "nombre_visites")
    @Builder.Default
    private int nombreVisites = 0;

    @Column(name = "nombre_no_shows")
    @Builder.Default
    private int nombreNoShows = 0;

    @Column(name = "adresse")
    private String adresse;

    @Column(name = "medecin_traitant")
    private String medecinTraitant;

    @Column(name = "groupe_sanguin")
    private String groupeSanguin;

    @Column(name = "allergies")
    private String allergies;

    @Column(name = "antecedents")
    @Lob
    private String antecedents;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    @Builder.Default
    @JsonIgnore
    private List<Ticket> tickets = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}