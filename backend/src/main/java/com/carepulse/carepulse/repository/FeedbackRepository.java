package com.carepulse.carepulse.repository;

import com.carepulse.carepulse.entity.Feedback;
import com.carepulse.carepulse.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByPatient(Patient patient);
    List<Feedback> findByModereFalse();

    @Query("SELECT AVG(f.noteGlobale) FROM Feedback f")
    Optional<Double> averageScore();
}

