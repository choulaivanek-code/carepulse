package com.carepulse.carepulse.controller;

import com.carepulse.carepulse.dto.response.ApiResponse;
import com.carepulse.carepulse.dto.response.MLStatusResponse;
import com.carepulse.carepulse.integration.MLServiceClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/ml")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN')")
public class MLController {

    private final MLServiceClient mlServiceClient;

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<MLStatusResponse>> getStatus() {
        return ResponseEntity.ok(ApiResponse.success("Statut du moteur IA", mlServiceClient.getStatus()));
    }

    @PostMapping("/train")
    public ResponseEntity<ApiResponse<Map<String, Object>>> train() {
        Map<String, Object> result = mlServiceClient.triggerTraining();
        if ("success".equals(result.get("status"))) {
            return ResponseEntity.ok(ApiResponse.success("Entraînement terminé avec succès", result));
        } else {
            return ResponseEntity.ok(ApiResponse.error(result.get("message").toString()));
        }
    }
}
