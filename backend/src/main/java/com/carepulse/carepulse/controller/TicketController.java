package com.carepulse.carepulse.controller;

import com.carepulse.carepulse.dto.request.CreateTicketRequest;
import com.carepulse.carepulse.dto.response.ApiResponse;
import com.carepulse.carepulse.dto.response.TicketResponse;
import com.carepulse.carepulse.entity.Ticket;
import com.carepulse.carepulse.entity.User;
import com.carepulse.carepulse.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('PATIENT', 'AGENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<TicketResponse>> creerTicket(
            @RequestBody CreateTicketRequest request,
            @AuthenticationPrincipal User user
    ) {
        Long targetUserId = user.getId();
        // Si c'est un agent ou admin qui crée pour un patient particulier
        if (request.getPatientId() != null && (user.getRole().name().equals("AGENT") || user.getRole().name().equals("ADMIN"))) {
            targetUserId = request.getPatientId();
        }
        
        Ticket ticket = ticketService.creerTicket(request, targetUserId);
        return ResponseEntity.ok(ApiResponse.success("Ticket créé", mapToResponse(ticket)));
    }

    @GetMapping("/mes-tickets")
    @PreAuthorize("hasAnyAuthority('PATIENT', 'AGENT', 'MEDECIN', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getMesTickets(@AuthenticationPrincipal User user) {
        List<Ticket> tickets = ticketService.getMesTickets(user.getId());
        List<TicketResponse> responses = tickets.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Mes tickets", responses));
    }

    @GetMapping("/actifs")
    @PreAuthorize("hasAnyAuthority('AGENT', 'MEDECIN', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getTousLesTicketsActifs() {
        List<Ticket> tickets = ticketService.getTousLesTicketsActifs();
        List<TicketResponse> responses = tickets.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Tickets actifs", responses));
    }

    @GetMapping("/console")
    @PreAuthorize("hasAuthority('MEDECIN')")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getTicketsConsole(@AuthenticationPrincipal User user) {
        List<Ticket> tickets = ticketService.getTicketsForMedecinConsole(user.getId());
        List<TicketResponse> responses = tickets.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Tickets de la file", responses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketResponse>> getTicket(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Détails du ticket", mapToResponse(ticketService.getTicketById(id))));
    }

    @PatchMapping("/{id}/confirmer-presence")
    @PreAuthorize("hasAnyAuthority('PATIENT', 'AGENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> confirmerPresence(@PathVariable Long id) {
        ticketService.confirmerPresence(id);
        return ResponseEntity.ok(ApiResponse.success("Présence confirmée", null));
    }

    @PatchMapping("/{id}/signaler-absence")
    @PreAuthorize("hasAnyAuthority('PATIENT', 'AGENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> signalerAbsence(@PathVariable Long id) {
        ticketService.signalerAbsence(id);
        return ResponseEntity.ok(ApiResponse.success("Absence signalée", null));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('PATIENT', 'AGENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> annulerTicket(@PathVariable Long id) {
        ticketService.annulerTicket(id);
        return ResponseEntity.ok(ApiResponse.success("Ticket annulé", null));
    }

    @PostMapping("/{id}/appeler")
    @PreAuthorize("hasAnyAuthority('MEDECIN', 'AGENT')")
    public ResponseEntity<ApiResponse<TicketResponse>> appelerPatient(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        Ticket ticket = ticketService.appellerPatient(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Patient appelé", mapToResponse(ticket)));
    }

    @GetMapping("/file/{fileAttenteId}")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getTicketsFile(@PathVariable Long fileAttenteId) {
        List<Ticket> tickets = ticketService.getTicketsEnAttente(fileAttenteId);
        List<TicketResponse> responses = tickets.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Tickets de la file", responses));
    }

    private TicketResponse mapToResponse(Ticket t) {
        int position = ticketService.getTicketPosition(t);

        return TicketResponse.builder()
                .id(t.getId())
                .numeroTicket(t.getNumeroTicket())
                .statut(t.getStatut())
                .priorite(t.getPriorite())
                .scoreTotal(t.getScoreTotal())
                .motif(t.getMotif())
                .estUrgence(t.isEstUrgence())
                .positionActuelle(position)
                .tempsAttenteEstime(t.getTempsAttenteEstime())
                .heureCreation(t.getHeureCreation())
                .heureDebut(t.getHeureDebut())
                .patientId(t.getPatient().getId())
                .patientNom(t.getPatient().getUser().getNom())
                .patientPrenom(t.getPatient().getUser().getPrenom())
                .fileAttenteId(t.getFileAttente().getId())
                .fileAttenteNom(t.getFileAttente().getNom())
                .scoreNoShow(t.getScoreNoShow())
                .medecinNom(t.getMedecin() != null ? t.getMedecin().getUser().getNom() + " " + t.getMedecin().getUser().getPrenom() : "Assignation en cours")
                .medecinJoursTravail(t.getMedecin() != null ? t.getMedecin().getJoursTravail() : null)
                .medecinHeureDebut(t.getMedecin() != null ? t.getMedecin().getHeureDebut() : null)
                .medecinHeureFin(t.getMedecin() != null ? t.getMedecin().getHeureFin() : null)
                .build();
    }
}
