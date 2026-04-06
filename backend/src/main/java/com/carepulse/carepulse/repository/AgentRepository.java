package com.carepulse.carepulse.repository;

import com.carepulse.carepulse.entity.Agent;
import com.carepulse.carepulse.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AgentRepository extends JpaRepository<Agent, Long> {
    Optional<Agent> findByUserId(Long userId);
    Optional<Agent> findByUser(User user);
    void deleteByUser(User user);
    List<Agent> findByDisponibleTrue();
}
