package com.carepulse.carepulse.service;

import com.carepulse.carepulse.dto.request.AgentCreateRequest;
import com.carepulse.carepulse.dto.request.MedecinCreateRequest;
import com.carepulse.carepulse.dto.request.ParametreSystemeRequest;
import com.carepulse.carepulse.dto.request.ReglePriorisationRequest;
import com.carepulse.carepulse.dto.request.UserUpdateRequest;
import com.carepulse.carepulse.entity.Agent;
import com.carepulse.carepulse.entity.Medecin;
import com.carepulse.carepulse.entity.ParametreSysteme;
import com.carepulse.carepulse.entity.ReglePriorisation;
import com.carepulse.carepulse.entity.User;
import com.carepulse.carepulse.enums.RoleType;
import com.carepulse.carepulse.exception.ResourceNotFoundException;
import com.carepulse.carepulse.repository.AgentRepository;
import com.carepulse.carepulse.repository.FileAttenteRepository;
import com.carepulse.carepulse.repository.MedecinRepository;
import com.carepulse.carepulse.repository.ParametreSystemeRepository;
import com.carepulse.carepulse.repository.PatientRepository;
import com.carepulse.carepulse.repository.ReglePriorisationRepository;
import com.carepulse.carepulse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class AdminService {

    private final ParametreSystemeRepository parametreSystemeRepository;
    private final ReglePriorisationRepository reglePriorisationRepository;
    private final UserRepository userRepository;
    private final MedecinRepository medecinRepository;
    private final FileAttenteRepository fileAttenteRepository;
    private final AgentRepository agentRepository;
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;
    private final FeedbackService feedbackService;

    public List<ParametreSysteme> getParametres() {
        return parametreSystemeRepository.findAll();
    }

    @Transactional
    public void updateParametre(ParametreSystemeRequest request) {
        ParametreSysteme param = parametreSystemeRepository.findByCle(request.getCle())
                .orElseThrow(() -> new ResourceNotFoundException("Paramètre non trouvé"));
        param.setValeur(request.getValeur());
        param.setDescription(request.getDescription());
        param.setDateModification(LocalDateTime.now());
        parametreSystemeRepository.save(param);
    }

    public List<User> getUtilisateurs() {
        return userRepository.findAll();
    }

    @Transactional
    public void createMedecin(MedecinCreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Cet email est déjà utilisé");
        }

        String password = request.getPassword() != null && !request.getPassword().isBlank() 
                ? request.getPassword() : "CarePulse2024!";

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(password))
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .telephone(request.getTelephone())
                .role(RoleType.MEDECIN)
                .active(true)
                .build();

        user = userRepository.save(user);

        Medecin medecin = Medecin.builder()
                .user(user)
                .specialite(request.getSpecialite())
                .numeroOrdre(request.getNumeroOrdre())
                .disponible(request.isDisponible())
                .joursTravail(request.getJoursTravail())
                .heureDebut(request.getHeureDebut())
                .heureFin(request.getHeureFin())
                .build();

        if (request.getFileAttenteId() != null) {
            medecin.setFileAttente(fileAttenteRepository.findById(request.getFileAttenteId())
                    .orElseThrow(() -> new ResourceNotFoundException("File d'attente non trouvée")));
        }

        medecinRepository.save(medecin);
        log.info("Médecin créé avec succès: {}", request.getEmail());
    }

    @Transactional
    public void createAgent(AgentCreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Cet email est déjà utilisé");
        }

        String password = request.getPassword() != null && !request.getPassword().isBlank() 
                ? request.getPassword() : "CarePulse2024!";

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(password))
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .telephone(request.getTelephone())
                .role(RoleType.AGENT)
                .active(true)
                .build();

        user = userRepository.save(user);

        Agent agent = Agent.builder()
                .user(user)
                .poste(request.getPoste())
                .disponible(true)
                .build();

        agentRepository.save(agent);
        log.info("Agent créé avec succès: {}", request.getEmail());
    }

    @Transactional
    public void updateUser(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        user.setNom(request.getNom());
        user.setPrenom(request.getPrenom());
        user.setTelephone(request.getTelephone());
        user.setActive(request.isActive());

        if (user.getRole() == RoleType.MEDECIN) {
            Medecin medecin = medecinRepository.findByUser(user)
                    .orElseThrow(() -> new ResourceNotFoundException("Médecin non trouvé"));
            medecin.setSpecialite(request.getSpecialite());
            medecin.setNumeroOrdre(request.getNumeroOrdre());
            medecin.setJoursTravail(request.getJoursTravail());
            if (request.getHeureDebut() != null && !request.getHeureDebut().isBlank()) {
                medecin.setHeureDebut(LocalTime.parse(request.getHeureDebut()));
            }
            if (request.getHeureFin() != null && !request.getHeureFin().isBlank()) {
                medecin.setHeureFin(LocalTime.parse(request.getHeureFin()));
            }
            medecin.setDisponible(request.isDisponible());

            if (request.getFileAttenteId() != null) {
                medecin.setFileAttente(fileAttenteRepository.findById(request.getFileAttenteId())
                        .orElseThrow(() -> new ResourceNotFoundException("File d'attente non trouvée")));
            }
            
            medecinRepository.save(medecin);
        } else if (user.getRole() == RoleType.AGENT) {
            Agent agent = agentRepository.findByUser(user)
                    .orElseThrow(() -> new ResourceNotFoundException("Agent non trouvé"));
            agent.setPoste(request.getPoste());
            agentRepository.save(agent);
        }

        userRepository.save(user);
        log.info("Utilisateur mis à jour: {}", user.getEmail());
    }

    @Transactional
    public void deleteUser(Long id, String currentAdminEmail) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        if (user.getEmail().equals(currentAdminEmail)) {
            throw new RuntimeException("Vous ne pouvez pas supprimer votre propre compte");
        }

        // Suppression manuelle des entités filles pour assurer la cascade correcte si non gérée par JPA
        if (user.getRole() == RoleType.MEDECIN) {
            medecinRepository.deleteByUser(user);
        } else if (user.getRole() == RoleType.AGENT) {
            agentRepository.deleteByUser(user);
        } else if (user.getRole() == RoleType.PATIENT) {
            patientRepository.deleteByUser(user);
        }

        userRepository.delete(user);
        log.info("Utilisateur supprimé: {}", user.getEmail());
    }

    @Transactional
    public void activerDesactiverUser(Long userId, String currentAdminEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        if (user.getEmail().equals(currentAdminEmail)) {
            throw new RuntimeException("Vous ne pouvez pas désactiver votre propre compte");
        }

        user.setActive(!user.isActive());
        userRepository.save(user);
        log.info("Statut utilisateur modifié ({}): {} -> {}", user.getEmail(), !user.isActive(), user.isActive());
    }

    public List<ReglePriorisation> getRegles() {
        return reglePriorisationRepository.findAll();
    }

    @Transactional
    public void creerRegle(ReglePriorisationRequest request) {
        ReglePriorisation regle = ReglePriorisation.builder()
                .nom(request.getNom())
                .description(request.getDescription())
                .critere(request.getCritere())
                .valeurSeuil(request.getValeurSeuil())
                .scoreAjoute(request.getScoreAjoute())
                .actif(request.isActif())
                .ordreApplication(request.getOrdreApplication())
                .build();
        reglePriorisationRepository.save(regle);
    }

    public void backupManual() {
        log.info("Lancement d'une sauvegarde manuelle du système...");
        // Simulation de la sauvegarde
        try {
            Thread.sleep(500); // Petit délai pour simuler l'opération
            log.info("Sauvegarde terminée avec succès.");
        } catch (InterruptedException e) {
            log.error("Erreur lors de la sauvegarde: {}", e.getMessage());
        }
    }
}
