package com.carepulse.carepulse.service;

import com.carepulse.carepulse.dto.request.LoginRequest;
import com.carepulse.carepulse.dto.request.RegisterRequest;
import com.carepulse.carepulse.dto.response.AuthResponse;
import com.carepulse.carepulse.entity.*;
import com.carepulse.carepulse.enums.RoleType;
import com.carepulse.carepulse.exception.CarePulseException;
import com.carepulse.carepulse.repository.*;
import com.carepulse.carepulse.security.JwtService;
import com.carepulse.carepulse.util.Constants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.context.annotation.Lazy;

import java.time.LocalDateTime;

@Service
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final MedecinRepository medecinRepository;
    private final AgentRepository agentRepository;
    private final AdministrateurRepository administrateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(
            UserRepository userRepository,
            PatientRepository patientRepository,
            MedecinRepository medecinRepository,
            AgentRepository agentRepository,
            AdministrateurRepository administrateurRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            @Lazy AuthenticationManager authenticationManager
    ) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.medecinRepository = medecinRepository;
        this.agentRepository = agentRepository;
        this.administrateurRepository = administrateurRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponse register(RegisterRequest request) {
        log.info("Tentative d'inscription pour l'email: {}", request.getEmail());
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new CarePulseException("Cet email est déjà utilisé", HttpStatus.CONFLICT);
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .telephone(request.getTelephone())
                .role(RoleType.PATIENT)
                .active(true)
                .build();

        userRepository.save(user);
        log.info("Utilisateur créé avec succès: {}", user.getEmail());

        createSecondaryEntity(user);
        log.info("Entité de rôle créée pour: {}", user.getEmail());

        String jwtToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return AuthResponse.builder()
                .token(jwtToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .email(user.getEmail())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .role(user.getRole())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        log.info("Tentative de connexion pour l'email: {}", request.getEmail());
        
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CarePulseException("Utilisateur non trouvé", HttpStatus.NOT_FOUND));

        resetLoginAttempts(user);

        String jwtToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        log.info("Connexion réussie pour l'utilisateur: {}", user.getEmail());

        return AuthResponse.builder()
                .token(jwtToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .email(user.getEmail())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .role(user.getRole())
                .build();
    }

    public void incrementLoginAttempts(User user) {
        user.setLoginAttempts(user.getLoginAttempts() + 1);
        if (user.getLoginAttempts() >= Constants.MAX_LOGIN_ATTEMPTS) {
            lockAccount(user);
        }
        userRepository.save(user);
    }

    public void resetLoginAttempts(User user) {
        user.setLoginAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);
    }

    private void createSecondaryEntity(User user) {
        switch (user.getRole()) {
            case PATIENT:
                Patient patient = Patient.builder()
                        .user(user)
                        .scoreFiabilite(1.0)
                        .nombreVisites(0)
                        .nombreNoShows(0)
                        .estEnceinte(false)
                        .aHandicap(false)
                        .build();
                patientRepository.save(patient);
                break;
            case MEDECIN:
                Medecin medecin = Medecin.builder()
                        .user(user)
                        .specialite("Généraliste")
                        .numeroOrdre("DEF-" + user.getId())
                        .tempsConsultationMoyen(15)
                        .disponible(true)
                        .build();
                medecinRepository.save(medecin);
                break;
            case AGENT:
                Agent agent = Agent.builder()
                        .user(user)
                        .poste("Accueil")
                        .disponible(true)
                        .build();
                agentRepository.save(agent);
                break;
            case ADMIN:
                Administrateur admin = Administrateur.builder()
                        .user(user)
                        .build();
                administrateurRepository.save(admin);
                break;
        }
    }

    private void lockAccount(User user) {
        user.setLockedUntil(LocalDateTime.now().plusMinutes(Constants.LOCK_TIME_MINUTES));
        log.warn("Compte verrouillé pour l'utilisateur: {}", user.getEmail());
    }
}
