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
public class NoShowRequest {
    @JsonProperty("heure")
    private int heure;

    @JsonProperty("jour_semaine")
    private int jourSemaine;

    @JsonProperty("historique_no_show")
    private int historiqueNoShow;

    @JsonProperty("priorite")
    private int priorite;
}
