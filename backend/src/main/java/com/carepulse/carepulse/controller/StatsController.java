package com.carepulse.carepulse.controller;

import com.carepulse.carepulse.dto.response.ApiResponse;
import com.carepulse.carepulse.dto.response.StatsDashboardResponse;
import com.carepulse.carepulse.service.StatisticsService;
import com.carepulse.carepulse.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatisticsService statisticsService;
    private final TicketRepository ticketRepository;

    @GetMapping("/dashboard")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('AGENT')")
    public ResponseEntity<ApiResponse<StatsDashboardResponse>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success("Statistiques du tableau de bord", statisticsService.getDashboardStats()));
    }
    @GetMapping("/test-error")
    public ResponseEntity<String> testError() {
        try {
            com.carepulse.carepulse.entity.Patient p = new com.carepulse.carepulse.entity.Patient();
            p.setId(1L);
            boolean b = ticketRepository.existsByPatientAndStatutIn(p, java.util.List.of(com.carepulse.carepulse.enums.TicketStatus.WAITING));
            return ResponseEntity.ok("Success: " + b);
        } catch(Exception e) {
            java.io.StringWriter sw = new java.io.StringWriter();
            e.printStackTrace(new java.io.PrintWriter(sw));
            return ResponseEntity.internalServerError().body(sw.toString());
        }
    }
}
