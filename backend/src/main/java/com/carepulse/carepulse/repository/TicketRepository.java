package com.carepulse.carepulse.repository;

import com.carepulse.carepulse.entity.FileAttente;
import com.carepulse.carepulse.entity.Medecin;
import com.carepulse.carepulse.entity.Patient;
import com.carepulse.carepulse.entity.Ticket;
import com.carepulse.carepulse.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByStatut(TicketStatus statut);
    List<Ticket> findByPatient(Patient patient);
    List<Ticket> findByFileAttente(FileAttente fileAttente);
    List<Ticket> findByMedecin(Medecin medecin);
    long countByStatutAndHeureCreationAfter(TicketStatus statut, LocalDateTime date);
    long countByFileAttenteAndHeureCreationAfter(FileAttente fileAttente, LocalDateTime date);
    List<Ticket> findByStatutAndFileAttenteOrderByScoreTotalDesc(TicketStatus statut, FileAttente fileAttente);
    List<Ticket> findByStatutOrderByScoreTotalDesc(TicketStatus statut);
    long countByStatut(TicketStatus statut);
    List<Ticket> findByStatutIn(List<TicketStatus> statuts);
    List<Ticket> findByFileAttenteAndStatutIn(FileAttente fileAttente, List<TicketStatus> statuts);
    long countByStatutIn(List<TicketStatus> statuts);
    boolean existsByPatientAndStatutIn(Patient patient, List<TicketStatus> statuts);

    long countByStatutAndHeureCreationBetween(
        TicketStatus statut, LocalDateTime debut, LocalDateTime fin
    );

    Optional<Ticket> findTopByFileAttenteAndHeureCreationBetweenOrderByNumeroTicketDesc(
        FileAttente fileAttente, LocalDateTime debut, LocalDateTime fin
    );

    Long countByFileAttenteAndHeureCreationBetween(
        FileAttente fileAttente, LocalDateTime debut, LocalDateTime fin
    );
}
