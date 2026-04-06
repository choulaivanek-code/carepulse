package com.carepulse.carepulse.dto.request;

import lombok.Data;

@Data
public class ConsultationRequest {
    private String symptomes;
    private String diagnostic;
    private String traitement;
    private String examens;
    private String observationsInternes;
}
