package com.carepulse.carepulse.config;

import com.carepulse.carepulse.entity.Clinique;
import com.carepulse.carepulse.entity.FileAttente;
import com.carepulse.carepulse.entity.User;
import com.carepulse.carepulse.entity.ParametreSysteme;
import com.carepulse.carepulse.enums.RoleType;
import com.carepulse.carepulse.repository.CliniqueRepository;
import com.carepulse.carepulse.repository.FileAttenteRepository;
import com.carepulse.carepulse.repository.UserRepository;
import com.carepulse.carepulse.repository.ParametreSystemeRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final CliniqueRepository cliniqueRepository;
    private final FileAttenteRepository fileAttenteRepository;
    private final UserRepository userRepository;
    private final ParametreSystemeRepository parametreSystemeRepository;
    private final PasswordEncoder passwordEncoder;

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Vérification de l'intégrité de la base de données...");
        ensureTablesExist();
        
        log.info("Démarrage de l'initialisation des données...");

        // 1. Initialisation de la Clinique
        Clinique clinique;
        if (cliniqueRepository.count() == 0) {
            log.info("Création de la clinique par défaut...");
            clinique = Clinique.builder()
                    .nom("Clinique CarePulse")
                    .adresse("123 Rue de la Santé, Paris")
                    .telephone("0123456789")
                    .email("contact@carepulse.com")
                    .capaciteMax(100)
                    .heureOuverture(LocalTime.of(8, 0))
                    .heureFermeture(LocalTime.of(20, 0))
                    .build();
            clinique = cliniqueRepository.save(clinique);
        } else {
            clinique = cliniqueRepository.findAll().get(0);
        }

        // 2. Initialisation des Files d'Attente
        if (fileAttenteRepository.count() == 0) {
            log.info("Création des files d'attente par défaut...");
            
            // Note: Les IDs seront générés automatiquement par la DB. 
            // Si la base est vide, ils commenceront à 1.
            
            FileAttente mg = FileAttente.builder()
                    .nom("Médecine Générale")
                    .type("GENERALE")
                    .actif(true)
                    .capaciteMax(50)
                    .clinique(clinique)
                    .build();
            
            FileAttente urg = FileAttente.builder()
                    .nom("Urgences")
                    .type("URGENCE")
                    .actif(true)
                    .capaciteMax(30)
                    .clinique(clinique)
                    .build();
            
            FileAttente ped = FileAttente.builder()
                    .nom("Pédiatrie")
                    .type("SPECIALISEE")
                    .actif(true)
                    .capaciteMax(20)
                    .clinique(clinique)
                    .build();
            
            FileAttente card = FileAttente.builder()
                    .nom("Cardiologie")
                    .type("SPECIALISEE")
                    .actif(true)
                    .capaciteMax(20)
                    .clinique(clinique)
                    .build();

            fileAttenteRepository.saveAll(List.of(mg, urg, ped, card));
            log.info("4 files d'attente créées successfully.");
        }

        // 3. Initialisation de l'Admin
        String adminEmail = "admin@carepulse.com";
        if (!userRepository.existsByEmail(adminEmail)) {
            log.info("Création du compte administrateur par défaut...");
            User admin = User.builder()
                    .email(adminEmail)
                    .password(passwordEncoder.encode("carepulse123"))
                    .nom("Admin")
                    .prenom("CarePulse")
                    .role(RoleType.ADMIN)
                    .active(true)
                    .verified(true)
                    .build();
            userRepository.save(admin);
            log.info("Compte admin créé : {} / carepulse123", adminEmail);
        }

        // 4. Initialisation des Paramètres Système
        if (parametreSystemeRepository.count() == 0) {
            log.info("Initialisation des paramètres système par défaut...");
            List<ParametreSysteme> defaultParams = List.of(
                ParametreSysteme.builder().cle("nom_centre").valeur("CarePulse Clinique").description("Nom officiel de l'établissement").build(),
                ParametreSysteme.builder().cle("ville").valeur("Douala").description("Ville de localisation").build(),
                ParametreSysteme.builder().cle("langue").valeur("FR").description("Langue par défaut du système").build(),
                ParametreSysteme.builder().cle("email_enabled").valeur("false").description("Activation des notifications par email").build(),
                ParametreSysteme.builder().cle("alertes_systeme").valeur("true").description("Activation des alertes critiques").build(),
                ParametreSysteme.builder().cle("max_tickets_jour").valeur("100").description("Nombre maximum de tickets autorisés par jour").build(),
                ParametreSysteme.builder().cle("duree_moyenne").valeur("15").description("Durée moyenne d'une consultation (min)").build(),
                ParametreSysteme.builder().cle("auto_annulation").valeur("30").description("Délai d'auto-annulation sans confirmation (min)").build(),
                ParametreSysteme.builder().cle("moteur_ml").valeur("false").description("Activation de l'IA pour le calcul des scores").build(),
                ParametreSysteme.builder().cle("seuil_no_show").valeur("70").description("Seuil de probabilité No-Show pour alerte (%)").build()
            );
            parametreSystemeRepository.saveAll(defaultParams);
            log.info("10 paramètres système initialisés.");
        }

        log.info("Initialisation des données terminée.");
    }

    private void ensureTablesExist() {
        log.info("Checking for missing tables...");
        String[] tables = {
            "users", "agents", "medecins", "patients", "administrateurs", 
            "cliniques", "files_attente", "tickets", "consultations", 
            "audit_logs", "notifications", "conversations", "messages", 
            "feedbacks", "regles_priorisation", "modeles_ml", "parametres_systeme"
        };

        for (String table : tables) {
            try {
                Query query = entityManager.createNativeQuery("SELECT 1 FROM " + table + " LIMIT 1");
                query.getResultList();
                log.info("Table '{}' existe ✅", table);
            } catch (Exception e) {
                log.warn("Table '{}' manquante ou inaccessible ❌", table);
                if (table.equals("parametres_systeme")) {
                    createParametreSystemeTable();
                }
                // Si d'autres tables manquent, Hibernate tentera de les recréer au prochain démarrage 
                // ou on pourrait ajouter d'autres scripts ici si nécessaire.
            }
        }
    }

    private void createParametreSystemeTable() {
        log.info("Création manuelle de la table 'parametres_systeme'...");
        try {
            entityManager.createNativeQuery(
                "CREATE TABLE IF NOT EXISTS parametres_systeme (" +
                "    id BIGINT AUTO_INCREMENT PRIMARY KEY," +
                "    cle VARCHAR(100) NOT NULL UNIQUE," +
                "    valeur VARCHAR(500)," +
                "    description VARCHAR(255)," +
                "    date_modification DATETIME" +
                ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"
            ).executeUpdate();
            log.info("Table 'parametres_systeme' créée avec succès ✅");
        } catch (Exception e) {
            log.error("Échec de la création de la table 'parametres_systeme': {}", e.getMessage());
        }
    }
}
