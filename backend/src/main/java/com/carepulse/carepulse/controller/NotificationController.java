package com.carepulse.carepulse.controller;

import com.carepulse.carepulse.dto.response.ApiResponse;
import com.carepulse.carepulse.dto.response.NotificationResponse;
import com.carepulse.carepulse.entity.Notification;
import com.carepulse.carepulse.entity.User;
import com.carepulse.carepulse.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> get(@AuthenticationPrincipal User user) {
        List<NotificationResponse> responses = notificationService.getNotificationsNonLues(user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Notifications non lues", responses));
    }

    @PutMapping("/{id}/lire")
    public ResponseEntity<ApiResponse<Void>> lire(@PathVariable Long id) {
        notificationService.marquerCommeLue(id);
        return ResponseEntity.ok(ApiResponse.success("Notification marquée comme lue", null));
    }

    private NotificationResponse mapToResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType())
                .titre(n.getTitre())
                .contenu(n.getContenu())
                .lue(n.isLue())
                .dateCreation(n.getDateCreation())
                .ticketId(n.getTicketId())
                .build();
    }
}
