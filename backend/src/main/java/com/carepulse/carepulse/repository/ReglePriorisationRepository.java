package com.carepulse.carepulse.repository;

import com.carepulse.carepulse.entity.ReglePriorisation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReglePriorisationRepository extends JpaRepository<ReglePriorisation, Long> {
    List<ReglePriorisation> findByActifTrueOrderByOrdreApplicationAsc();
}
