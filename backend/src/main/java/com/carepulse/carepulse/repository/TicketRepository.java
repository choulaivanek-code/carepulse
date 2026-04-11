package com.carepulse.carepulse.repository;

import com.carepulse.carepulse.entity.FileAttente;
import com.carepulse.carepulse.entity.Medecin;
import com.carepulse.carepulse.entity.Patient;
import com.carepulse.carepulse.entity.Ticket;
import com.carepulse.carepulse.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
    long countByFileAttenteAndStatutIn(FileAttente fileAttente, List<TicketStatus> statuts);
    long countByStatutIn(List<TicketStatus> statuts);
    boolean existsByPatientAndStatutIn(Patient patient, List<TicketStatus> statuts);
    List<Ticket> findByMedecinIsNullAndStatutIn(List<TicketStatus> statuts);

    long countByStatutAndHeureCreationBetween(TicketStatus statut, LocalDateTime debut, LocalDateTime fin);

    long countByHeureCreationBetween(LocalDateTime debut, LocalDateTime fin);

    @Query("SELECT AVG(t.tempsAttenteEstime) FROM Ticket t WHERE t.heureCreation BETWEEN :debut AND :fin")
    Double avgTempsAttenteEstime(@Param("debut") LocalDateTime debut, @Param("fin") LocalDateTime fin);

    @Query("SELECT HOUR(t.heureCreation) as heure, COUNT(t) as count FROM Ticket t WHERE t.heureCreation BETWEEN :debut AND :fin GROUP BY HOUR(t.heureCreation) ORDER BY heure")
    List<Object[]> countByHeureCreationGroupByHeure(@Param("debut") LocalDateTime debut, @Param("fin") LocalDateTime fin);

    @Query("SELECT t.medecin, COUNT(t) as consultations FROM Ticket t WHERE t.statut = 'COMPLETED' AND t.medecin IS NOT NULL GROUP BY t.medecin ORDER BY consultations DESC")
    List<Object[]> findTopMedecinsByConsultations(org.springframework.data.domain.Pageable pageable);

    Optional<Ticket> findTopByFileAttenteAndHeureCreationBetweenOrderByNumeroTicketDesc(
        FileAttente fileAttente, LocalDateTime debut, LocalDateTime fin
    );

    Long countByFileAttenteAndHeureCreationBetween(
        FileAttente fileAttente, LocalDateTime debut, LocalDateTime fin
    );

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.fileAttente = :file AND t.statut IN :statuts AND t.heureCreation < :heureCreation")
    long countTicketsAvant(@Param("file") FileAttente file, @Param("statuts") List<TicketStatus> statuts, @Param("heureCreation") LocalDateTime heureCreation);

    @Query("SELECT DATE(t.heureCreation) as date, COUNT(t) as count FROM Ticket t WHERE t.heureCreation BETWEEN :debut AND :fin GROUP BY DATE(t.heureCreation) ORDER BY date")
    List<Object[]> countByHeureCreationGroupByJour(@Param("debut") LocalDateTime debut, @Param("fin") LocalDateTime fin);

    @Query("SELECT t.fileAttente.nom, COUNT(t) FROM Ticket t WHERE t.heureCreation BETWEEN :debut AND :fin GROUP BY t.fileAttente.nom")
    List<Object[]> countByFileAttenteGroupByNom(@Param("debut") LocalDateTime debut, @Param("fin") LocalDateTime fin);

    @Query("SELECT DATE(t.heureCreation) as date, COUNT(t) as count FROM Ticket t WHERE t.statut = 'NO_SHOW' AND t.heureCreation BETWEEN :debut AND :fin GROUP BY DATE(t.heureCreation) ORDER BY date")
    List<Object[]> countNoShowsByHeureCreationGroupByJour(@Param("debut") LocalDateTime debut, @Param("fin") LocalDateTime fin);

    @Query("SELECT t.medecin, COUNT(t), AVG(TIMESTAMPDIFF(MINUTE, t.heureDebut, t.heureFin)) FROM Ticket t WHERE t.statut = 'COMPLETED' AND t.medecin IS NOT NULL AND t.heureCreation BETWEEN :debut AND :fin GROUP BY t.medecin")
    List<Object[]> getMedecinPerformances(@Param("debut") LocalDateTime debut, @Param("fin") LocalDateTime fin);

    List<Ticket> findAllByHeureCreationBetweenOrderByHeureCreationDesc(LocalDateTime debut, LocalDateTime fin);
}
