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
public class WaitTimeRequest {
    @JsonProperty("heure")
    private int heure;

    @JsonProperty("jour_semaine")
    private int jourSemaine;

    @JsonProperty("file_id")
    private int fileId;

    @JsonProperty("nb_tickets_actifs")
    private int nbTicketsActifs;

    @JsonProperty("priorite")
    private int priorite;
}
