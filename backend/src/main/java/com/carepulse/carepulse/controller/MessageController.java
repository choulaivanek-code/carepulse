package com.carepulse.carepulse.controller;

import com.carepulse.carepulse.dto.request.CreateMessageRequest;
import com.carepulse.carepulse.dto.response.ApiResponse;
import com.carepulse.carepulse.dto.response.MessageResponse;
import com.carepulse.carepulse.entity.Message;
import com.carepulse.carepulse.entity.User;
import com.carepulse.carepulse.exception.ResourceNotFoundException;
import com.carepulse.carepulse.repository.UserRepository;
import com.carepulse.carepulse.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('PATIENT', 'AGENT', 'MEDECIN')")
    public ResponseEntity<ApiResponse<MessageResponse>> envoyerMessage(
            @RequestBody CreateMessageRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        MessageResponse response = messageService.envoyerMessage(request, userDetails.getUsername());
        return ResponseEntity.status(201).body(ApiResponse.success("Message envoyé", response));
    }

    @GetMapping("/conversation/{ticketId}")
    @PreAuthorize("hasAnyAuthority('PATIENT', 'AGENT', 'MEDECIN')")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getMessagesByTicket(
            @PathVariable Long ticketId) {
        List<Message> messages = messageService.getMessagesByTicketId(ticketId);
        List<MessageResponse> responses = messages.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Messages récupérés", responses));
    }

    @PutMapping("/conversation/{conversationId}/lire")
    @PreAuthorize("hasAnyAuthority('PATIENT', 'AGENT', 'MEDECIN')")
    public ResponseEntity<ApiResponse<Void>> marquerCommeLu(
            @PathVariable Long conversationId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));
        messageService.marquerCommeLu(conversationId, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Messages marqués comme lus", null));
    }

    private MessageResponse mapToResponse(Message m) {
        return MessageResponse.builder()
                .id(m.getId())
                .contenu(m.getContenu())
                .expediteurId(m.getExpediteur().getId())
                .expediteurNom(m.getExpediteur().getPrenom() + " " + m.getExpediteur().getNom())
                .statut(m.getStatut())
                .dateEnvoi(m.getDateEnvoi())
                .build();
    }
}
