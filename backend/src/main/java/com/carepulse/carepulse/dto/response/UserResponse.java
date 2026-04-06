package com.carepulse.carepulse.dto.response;

import com.carepulse.carepulse.enums.RoleType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String email;
    private String nom;
    private String prenom;
    private String telephone;
    private RoleType role;
    private boolean active;
    private LocalDateTime createdAt;
}
