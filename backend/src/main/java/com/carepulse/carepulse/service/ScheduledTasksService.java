package com.carepulse.carepulse.service;

import com.carepulse.carepulse.entity.FileAttente;
import com.carepulse.carepulse.entity.Ticket;
import com.carepulse.carepulse.enums.TicketStatus;
import com.carepulse.carepulse.integration.MLServiceClient;
import com.carepulse.carepulse.integration.OverloadRequest;
import com.carepulse.carepulse.integration.OverloadResponse;
import com.carepulse.carepulse.repository.FileAttenteRepository;
import com.carepulse.carepulse.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class ScheduledTasksService {

    private final TicketRepository ticketRepository;
    private final FileAttenteRepository fileAttenteRepository;
    private final MLServiceClient mlServiceClient;
    private final WebSocketService webSocketService;

    @Scheduled(fixedRate = 300000) // 5min
    public void detectOverload() {
        log.info("Tâche planifiée: Détection de surcharge");
        List<FileAttente> files = fileAttenteRepository.findByActifTrue();
        for (FileAttente file : files) {
            int activeTickets = (int) ticketRepository.findByFileAttente(file).stream()
                    .filter(t -> t.getStatut() == TicketStatus.WAITING)
                    .count();
            
            /* ML Surcharge - Désactivé temporairement
            OverloadRequest request = OverloadRequest.builder()
                    .nombreTicketsActifs(activeTickets)
                    .capaciteMax(file.getCapaciteMax())
                    .heureJournee(LocalDateTime.now().getHour())
                    .build();
            
            OverloadResponse response = mlServiceClient.detectOverload(request);
            if (response.isSurcharge()) {
                webSocketService.sendOverloadAlert(response.getNiveau(), activeTickets, response.getMessage());
            }
            */
            
            // Fallback local simple
            if (activeTickets >= file.getCapaciteMax() * 0.9) {
                webSocketService.sendOverloadAlert("CRITICAL", activeTickets, "Capacité maximale presque atteinte (Local)");
            }
        }
    }

    @Scheduled(fixedRate = 600000) // 10min
    public void recalculerPriorites() {
        log.info("Tâche planifiée: Recalcul des priorités");
        // Logic to trigger recalculation for all active queues
    }
}
