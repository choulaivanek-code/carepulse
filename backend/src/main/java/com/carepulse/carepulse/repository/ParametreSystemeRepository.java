package com.carepulse.carepulse.repository;

import com.carepulse.carepulse.entity.ParametreSysteme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ParametreSystemeRepository extends JpaRepository<ParametreSysteme, Long> {
    Optional<ParametreSysteme> findByCle(String cle);
}
