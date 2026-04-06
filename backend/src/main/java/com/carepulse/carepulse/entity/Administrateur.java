package com.carepulse.carepulse.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "administrateurs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Administrateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
