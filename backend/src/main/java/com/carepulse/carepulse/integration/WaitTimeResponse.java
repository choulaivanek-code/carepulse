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
public class WaitTimeResponse {
    @JsonProperty("temps_attente_minutes")
    private int tempsAttenteMinutes;

    @JsonProperty("nb_samples")
    private int nbSamples;

    @JsonProperty("type")
    private String type;
}
