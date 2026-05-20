package com.carepulse.carepulse.controller;

import com.carepulse.carepulse.dto.response.ApiResponse;
import com.carepulse.carepulse.dto.response.PatientPointsDTO;
import com.carepulse.carepulse.entity.Patient;
import com.carepulse.carepulse.entity.User;
import com.carepulse.carepulse.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientRepository patientRepository;

    @GetMapping("/moi/points")
    public ResponseEntity<ApiResponse<PatientPointsDTO>> getMesPoints(@AuthenticationPrincipal User user) {
        Patient patient = patientRepository.findByUserId(user.getId())
                .orElseThrow(() -> new com.carepulse.carepulse.exception.ResourceNotFoundException("Patient non trouvé"));

        int points = patient.getPointsFidelite();
        String niveau;
        int pointsVersSuivant;
        int pointsRequisSuivant = 50;
        String message;

        if (points <= 50) {
            niveau = "Bronze";
            pointsVersSuivant = points;
            message = "Encore " + (51 - points) + " points pour atteindre Argent 🥈";
        } else if (points <= 100) {
            niveau = "Argent";
            pointsVersSuivant = points - 50;
            message = "Encore " + (101 - points) + " points pour atteindre Or 🥇";
        } else {
            niveau = "Or";
            pointsVersSuivant = 50; // Full bar
            message = "Félicitations ! Vous êtes au niveau Or 🥇";
        }

        PatientPointsDTO dto = PatientPointsDTO.builder()
                .points(points)
                .niveau(niveau)
                .pointsVersSuivant(pointsVersSuivant)
                .pointsRequisSuivant(pointsRequisSuivant)
                .messageProgression(message)
                .build();

        return ResponseEntity.ok(ApiResponse.success("Points récupérés", dto));
    }
}
