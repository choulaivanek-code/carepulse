package com.carepulse.carepulse.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientPointsDTO {
    private int points;
    private String niveau;
    private int pointsVersSuivant;
    private int pointsRequisSuivant;
    private String messageProgression;
}
