package com.carepulse.carepulse.repository;

import com.carepulse.carepulse.entity.Patient;
import com.carepulse.carepulse.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByUserId(Long userId);
    Optional<Patient> findByUserEmail(String email);
    void deleteByUser(User user);
}
