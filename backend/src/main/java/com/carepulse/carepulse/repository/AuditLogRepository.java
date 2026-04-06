package com.carepulse.carepulse.repository;

import com.carepulse.carepulse.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByUserId(Long userId);
    List<AuditLog> findByAction(String action);
    long countByUserIdAndSuccesFalseAndDateActionAfter(Long userId, LocalDateTime date);
}
