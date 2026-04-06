package com.carepulse.carepulse.integration;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoShowResponse {
    private double scoreNoShow;
    private boolean risqueEleve;
}
