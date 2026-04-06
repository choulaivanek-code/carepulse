package com.carepulse.carepulse.controller;

import com.carepulse.carepulse.dto.request.ConsultationRequest;
import com.carepulse.carepulse.dto.response.ApiResponse;
import com.carepulse.carepulse.dto.response.ConsultationResponse;
import com.carepulse.carepulse.entity.Consultation;
import com.carepulse.carepulse.entity.User;
import com.carepulse.carepulse.service.ConsultationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/consultations")
@RequiredArgsConstructor
public class ConsultationController {

    private final ConsultationService consultationService;

    @PostMapping("/demarrer/{ticketId}")
    @PreAuthorize("hasAuthority('MEDECIN')")
    public ResponseEntity<ApiResponse<ConsultationResponse>> demarrer(
            @PathVariable Long ticketId,
            @AuthenticationPrincipal User user
    ) {
        // user id mapping logic...
        Consultation c = consultationService.demarrerConsultation(ticketId, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Consultation démarrée", mapToResponse(c)));
    }

    @PutMapping("/{ticketId}/contenu")
    @PreAuthorize("hasAuthority('MEDECIN')")
    public ResponseEntity<ApiResponse<Void>> saisirContenu(
            @PathVariable Long ticketId,
            @RequestBody ConsultationRequest request
    ) {
        consultationService.saisirContenuMedical(ticketId, request);
        return ResponseEntity.ok(ApiResponse.success("Contenu mis à jour", null));
    }

    @PostMapping("/{ticketId}/cloturer")
    @PreAuthorize("hasAuthority('MEDECIN')")
    public ResponseEntity<ApiResponse<Void>> cloturer(
            @PathVariable Long ticketId,
            @AuthenticationPrincipal User user
    ) {
        consultationService.cloturerConsultation(ticketId, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Consultation clôturée", null));
    }

    @GetMapping("/patient/{id}")
    public ResponseEntity<ApiResponse<List<ConsultationResponse>>> getPatientHistory(@PathVariable Long id) {
        List<ConsultationResponse> responses = consultationService.getConsultationsByUserId(id).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Historique médical", responses));
    }

    private ConsultationResponse mapToResponse(Consultation c) {
        return ConsultationResponse.builder()
                .id(c.getId())
                .symptomes(c.getSymptomes())
                .diagnostic(c.getDiagnostic())
                .traitement(c.getTraitement())
                .examens(c.getExamens())
                .dateDebut(c.getDateDebut())
                .dateFin(c.getDateFin())
                .dureeReelle(c.getDureeReelle())
                .medecinNom(c.getMedecin().getUser().getNom())
                .patientNom(c.getPatient().getUser().getNom())
                .build();
    }
}
