package com.carepulse.carepulse.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "files_attente")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FileAttente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    private String type; // String simple, pas enum

    @Builder.Default
    private Boolean actif = true;

    @Column(name = "capacite_max")
    private int capaciteMax;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "clinique_id")
    @JsonIgnore
    private Clinique clinique;

    @OneToMany(mappedBy = "fileAttente", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Ticket> tickets = new ArrayList<>();
}
