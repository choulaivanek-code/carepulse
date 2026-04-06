package com.carepulse.carepulse.repository;

import com.carepulse.carepulse.entity.Administrateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdministrateurRepository extends JpaRepository<Administrateur, Long> {
    Optional<Administrateur> findByUserId(Long userId);
    Optional<Administrateur> findByUserEmail(String email);
}
