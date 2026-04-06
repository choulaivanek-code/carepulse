package com.carepulse.carepulse.controller;

import com.carepulse.carepulse.dto.request.LoginRequest;
import com.carepulse.carepulse.dto.request.RegisterRequest;
import com.carepulse.carepulse.dto.response.ApiResponse;
import com.carepulse.carepulse.dto.response.AuthResponse;
import com.carepulse.carepulse.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Inscription réussie", authService.register(request)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Connexion réussie", authService.login(request)));
    }
}
