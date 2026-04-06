package com.carepulse.carepulse.repository;

import com.carepulse.carepulse.entity.Clinique;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CliniqueRepository extends JpaRepository<Clinique, Long> {
}
