package com.carepulse.carepulse.integration;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoShowResponse {
    @JsonProperty("score_no_show")
    private double scoreNoShow;

    @JsonProperty("risque_eleve")
    private boolean risqueEleve;

    @JsonProperty("nb_samples")
    private int nbSamples;

    @JsonProperty("type")
    private String type;
}
