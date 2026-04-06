package com.carepulse.carepulse.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileAttenteResponse {
    private Long id;
    private String nom;
    private String type;
    private boolean actif;
    private int capaciteMax;
    private int nombreTicketsEnAttente;
    private int tempsAttenteEstime;
}
