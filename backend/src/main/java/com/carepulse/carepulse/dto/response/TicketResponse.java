package com.carepulse.carepulse.dto.response;

import com.carepulse.carepulse.enums.PriorityType;
import com.carepulse.carepulse.enums.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponse {
    private Long id;
    private String numeroTicket;
    private TicketStatus statut;
    private PriorityType priorite;
    private int scoreTotal;
    private String motif;
    private boolean estUrgence;
    private int positionActuelle;
    private int tempsAttenteEstime;
    private LocalDateTime heureCreation;
    private LocalDateTime heureDebut;
    private Long patientId;
    private String patientNom;
    private String patientPrenom;
    private String medecinNom;
    private Long fileAttenteId;
    private String fileAttenteNom;
    private double scoreNoShow;
    private String medecinJoursTravail;
    private LocalTime medecinHeureDebut;
    private LocalTime medecinHeureFin;
}
