package com.carepulse.carepulse.controller;

import com.carepulse.carepulse.dto.request.FeedbackRequest;
import com.carepulse.carepulse.dto.response.ApiResponse;
import com.carepulse.carepulse.dto.response.FeedbackResponse;
import com.carepulse.carepulse.entity.Feedback;
import com.carepulse.carepulse.entity.User;
import com.carepulse.carepulse.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/feedbacks")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping("")
    @PreAuthorize("hasAuthority('PATIENT')")
    public ResponseEntity<ApiResponse<FeedbackResponse>> soumettre(
            @RequestBody FeedbackRequest request,
            @AuthenticationPrincipal User user
    ) {
        Feedback f = feedbackService.soumettreFeedback(request, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Feedback soumis", mapToResponse(f)));
    }

    private FeedbackResponse mapToResponse(Feedback f) {
        return FeedbackResponse.builder()
                .id(f.getId())
                .noteGlobale(f.getNoteGlobale())
                .noteAttenteTemps(f.getNoteAttenteTemps())
                .noteAccueil(f.getNoteAccueil())
                .noteMedecin(f.getNoteMedecin())
                .noteProprete(f.getNoteProprete())
                .commentaire(f.getCommentaire())
                .recommande(f.isRecommande())
                .anonyme(f.isAnonyme())
                .modere(f.isModere())
                .dateCreation(f.getDateCreation())
                .build();
    }
}
