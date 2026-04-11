package com.carepulse.carepulse.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MLStatusResponse {
    private boolean serviceActif;
    private List<ModeleInfo> modeles;
    private double precisionMoyenne;
    private List<Map<String, Object>> optimisationAttente;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ModeleInfo {
        private String nom;
        private String statut;
        private double precision;
        
        @JsonProperty("nb_samples")
        private int nbSamples;
        
        @JsonProperty("last_trained")
        private String lastTrained;
        
        @JsonProperty("type")
        private String type;
    }
}
