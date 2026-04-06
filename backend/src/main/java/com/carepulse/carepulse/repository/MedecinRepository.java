package com.carepulse.carepulse.repository;

import com.carepulse.carepulse.entity.FileAttente;
import com.carepulse.carepulse.entity.Medecin;
import com.carepulse.carepulse.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedecinRepository extends JpaRepository<Medecin, Long> {
    Optional<Medecin> findByUserId(Long userId);
    Optional<Medecin> findByUser(User user);
    void deleteByUser(User user);
    List<Medecin> findByDisponibleTrue();
    List<Medecin> findBySpecialite(String specialite);
    List<Medecin> findByFileAttenteId(Long fileAttenteId);
    Optional<Medecin> findFirstByFileAttenteAndDisponibleTrue(FileAttente fileAttente);
    Optional<Medecin> findByUserEmail(String email);
}
