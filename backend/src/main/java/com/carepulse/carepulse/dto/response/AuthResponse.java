package com.carepulse.carepulse.dto.response;

import com.carepulse.carepulse.enums.RoleType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String refreshToken;
    private Long userId;
    private String email;
    private String nom;
    private String prenom;
    private RoleType role;
}
