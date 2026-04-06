package com.carepulse.carepulse.controller;

import com.carepulse.carepulse.dto.response.ApiResponse;
import com.carepulse.carepulse.dto.response.FileAttenteResponse;
import com.carepulse.carepulse.entity.FileAttente;
import com.carepulse.carepulse.service.FileAttenteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileAttenteController {

    private final FileAttenteService fileAttenteService;

    @GetMapping("")
    public ResponseEntity<ApiResponse<List<FileAttenteResponse>>> getFiles() {
        List<FileAttenteResponse> responses = fileAttenteService.getFilesActives().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Files actives", responses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FileAttenteResponse>> getFile(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("File d'attente", mapToResponse(fileAttenteService.getFileById(id))));
    }

    private FileAttenteResponse mapToResponse(FileAttente f) {
        return FileAttenteResponse.builder()
                .id(f.getId())
                .nom(f.getNom())
                .type(f.getType())
                .actif(f.isActif())
                .capaciteMax(f.getCapaciteMax())
                .nombreTicketsEnAttente(0) // Logic needed in service
                .tempsAttenteEstime(fileAttenteService.calculerTempsAttente(f.getId()))
                .build();
    }
}
