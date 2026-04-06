package com.carepulse.carepulse.integration;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OverloadRequest {
    private int nombreTicketsActifs;
    private int capaciteMax;
    private int nombreMedecins;
    private int heureJournee;
}
