package com.carepulse.carepulse.controller;

import com.carepulse.carepulse.dto.response.ApiResponse;
import com.carepulse.carepulse.dto.response.MedecinResponse;
import com.carepulse.carepulse.entity.Medecin;
import com.carepulse.carepulse.repository.MedecinRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.carepulse.carepulse.entity.User;
import com.carepulse.carepulse.exception.ResourceNotFoundException;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/medecins")
@RequiredArgsConstructor
public class MedecinController {

    private final MedecinRepository medecinRepository;

    @GetMapping("/par-file/{fileAttenteId}")
    public ResponseEntity<ApiResponse<List<MedecinResponse>>> getMedecinsParFile(@PathVariable Long fileAttenteId) {
        List<Medecin> medecins = medecinRepository.findByFileAttenteId(fileAttenteId);
        List<MedecinResponse> response = medecins.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Médecins de la file", response));
    }

    @GetMapping("/moi")
    public ResponseEntity<ApiResponse<MedecinResponse>> getMedecinConnecte(@AuthenticationPrincipal User user) {
        Medecin medecin = medecinRepository.findByUserEmail(user.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Médecin non trouvé"));
        return ResponseEntity.ok(ApiResponse.success("Infos médecin", mapToResponse(medecin)));
    }

    @PatchMapping("/pause")
    public ResponseEntity<ApiResponse<MedecinResponse>> togglePause(@AuthenticationPrincipal User user) {
        Medecin medecin = medecinRepository.findByUserEmail(user.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Médecin non trouvé"));
        medecin.setDisponible(!medecin.isDisponible());
        medecinRepository.save(medecin);
        return ResponseEntity.ok(ApiResponse.success(
                medecin.isDisponible() ? "Médecin en ligne" : "Médecin en pause", 
                mapToResponse(medecin)
        ));
    }

    private MedecinResponse mapToResponse(Medecin m) {
        return MedecinResponse.builder()
                .id(m.getId())
                .nom(m.getUser().getNom())
                .prenom(m.getUser().getPrenom())
                .specialite(m.getSpecialite())
                .joursTravail(m.getJoursTravail())
                .heureDebut(m.getHeureDebut())
                .heureFin(m.getHeureFin())
                .disponible(m.isDisponible())
                .fileAttenteId(m.getFileAttente() != null ? m.getFileAttente().getId() : null)
                .fileAttenteNom(m.getFileAttente() != null ? m.getFileAttente().getNom() : null)
                .build();
    }
}
