package com.carepulse.carepulse.repository;

import com.carepulse.carepulse.entity.FileAttente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FileAttenteRepository extends JpaRepository<FileAttente, Long> {
    List<FileAttente> findByActifTrue();
    List<FileAttente> findByCliniqueId(Long cliniqueId);
}
