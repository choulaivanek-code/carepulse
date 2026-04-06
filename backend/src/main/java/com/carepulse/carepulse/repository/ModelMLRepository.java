package com.carepulse.carepulse.repository;

import com.carepulse.carepulse.entity.ModelML;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ModelMLRepository extends JpaRepository<ModelML, Long> {
    List<ModelML> findByActifTrue();
    Optional<ModelML> findByNom(String nom);
}
