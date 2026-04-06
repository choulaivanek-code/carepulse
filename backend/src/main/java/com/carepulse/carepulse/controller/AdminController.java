package com.carepulse.carepulse.controller;

import com.carepulse.carepulse.dto.request.AgentCreateRequest;
import com.carepulse.carepulse.dto.request.MedecinCreateRequest;
import com.carepulse.carepulse.dto.request.ParametreSystemeRequest;
import com.carepulse.carepulse.dto.request.ReglePriorisationRequest;
import com.carepulse.carepulse.dto.request.UserUpdateRequest;
import com.carepulse.carepulse.dto.response.ApiResponse;
import com.carepulse.carepulse.entity.ParametreSysteme;
import com.carepulse.carepulse.entity.ReglePriorisation;
import com.carepulse.carepulse.entity.User;
import com.carepulse.carepulse.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/parametres")
    public ResponseEntity<ApiResponse<List<ParametreSysteme>>> getParametres() {
        return ResponseEntity.ok(ApiResponse.success("Paramètres système", adminService.getParametres()));
    }

    @PutMapping("/parametres")
    public ResponseEntity<ApiResponse<Void>> updateParametre(@RequestBody ParametreSystemeRequest request) {
        adminService.updateParametre(request);
        return ResponseEntity.ok(ApiResponse.success("Paramètre mis à jour", null));
    }

    @GetMapping("/utilisateurs")
    public ResponseEntity<ApiResponse<List<com.carepulse.carepulse.dto.response.UserResponse>>> getUtilisateurs() {
        List<com.carepulse.carepulse.dto.response.UserResponse> responses = adminService.getUtilisateurs()
                .stream()
                .map(this::mapUserToResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.success("Liste des utilisateurs", responses));
    }

    private com.carepulse.carepulse.dto.response.UserResponse mapUserToResponse(User user) {
        return com.carepulse.carepulse.dto.response.UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .telephone(user.getTelephone())
                .role(user.getRole())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }

    @PostMapping("/users/medecin")
    public ResponseEntity<ApiResponse<Void>> createMedecin(@Valid @RequestBody MedecinCreateRequest request) {
        adminService.createMedecin(request);
        return ResponseEntity.ok(ApiResponse.success("Médecin créé avec succès", null));
    }

    @PostMapping("/users/agent")
    public ResponseEntity<ApiResponse<Void>> createAgent(@Valid @RequestBody AgentCreateRequest request) {
        adminService.createAgent(request);
        return ResponseEntity.ok(ApiResponse.success("Agent créé avec succès", null));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> updateUser(@PathVariable Long id, @Valid @RequestBody UserUpdateRequest request) {
        adminService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.success("Utilisateur mis à jour", null));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id, Authentication authentication) {
        adminService.deleteUser(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Utilisateur supprimé", null));
    }

    @PostMapping("/utilisateurs/{id}/toggle")
    public ResponseEntity<ApiResponse<Void>> toggleUser(@PathVariable Long id, Authentication authentication) {
        adminService.activerDesactiverUser(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Statut utilisateur modifié", null));
    }

    @GetMapping("/regles")
    public ResponseEntity<ApiResponse<List<ReglePriorisation>>> getRegles() {
        return ResponseEntity.ok(ApiResponse.success("Règles de priorisation", adminService.getRegles()));
    }

    @PostMapping("/regles")
    public ResponseEntity<ApiResponse<Void>> creerRegle(@RequestBody ReglePriorisationRequest request) {
        adminService.creerRegle(request);
        return ResponseEntity.ok(ApiResponse.success("Règle créée", null));
    }

    @PostMapping("/backup")
    public ResponseEntity<ApiResponse<Void>> backup() {
        adminService.backupManual();
        return ResponseEntity.ok(ApiResponse.success("Sauvegarde lancée avec succès", null));
    }
}
