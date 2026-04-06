package com.carepulse.carepulse.integration;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OverloadResponse {
    private String niveau;
    private boolean surcharge;
    private String message;
}
