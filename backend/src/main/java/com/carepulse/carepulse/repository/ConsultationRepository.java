package com.carepulse.carepulse.repository;

import com.carepulse.carepulse.entity.Consultation;
import com.carepulse.carepulse.entity.Medecin;
import com.carepulse.carepulse.entity.Patient;
import com.carepulse.carepulse.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConsultationRepository extends JpaRepository<Consultation, Long> {
    List<Consultation> findByPatient(Patient patient);
    List<Consultation> findByMedecin(Medecin medecin);
    Optional<Consultation> findFirstByTicketOrderByIdDesc(Ticket ticket);
}
