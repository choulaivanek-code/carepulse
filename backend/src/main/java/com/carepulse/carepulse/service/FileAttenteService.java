package com.carepulse.carepulse.service;

import com.carepulse.carepulse.entity.FileAttente;
import com.carepulse.carepulse.entity.Ticket;
import com.carepulse.carepulse.enums.TicketStatus;
import com.carepulse.carepulse.exception.ResourceNotFoundException;
import com.carepulse.carepulse.repository.FileAttenteRepository;
import com.carepulse.carepulse.repository.TicketRepository;
import com.carepulse.carepulse.util.Constants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class FileAttenteService {

    private final FileAttenteRepository fileAttenteRepository;
    private final TicketRepository ticketRepository;
    private final WebSocketService webSocketService;

    public List<FileAttente> getFilesActives() {
        return fileAttenteRepository.findByActifTrue();
    }

    public FileAttente getFileById(Long id) {
        return fileAttenteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("File d'attente non trouvée"));
    }

    public int calculerPosition(Ticket ticket) {
        List<Ticket> ticketsEnAttente = ticketRepository.findByFileAttente(ticket.getFileAttente())
                .stream()
                .filter(t -> t.getStatut() == TicketStatus.WAITING)
                .sorted((t1, t2) -> Integer.compare(t2.getScoreTotal(), t1.getScoreTotal()))
                .collect(Collectors.toList());

        int position = ticketsEnAttente.indexOf(ticket) + 1;
        return position > 0 ? position : 1;
    }

    public int calculerTempsAttente(Long fileAttenteId) {
        FileAttente file = getFileById(fileAttenteId);
        List<Ticket> ticketsEnAttente = ticketRepository.findByFileAttente(file)
                .stream()
                .filter(t -> t.getStatut() == TicketStatus.WAITING)
                .collect(Collectors.toList());

        // Simple logic: num tickets * 15 min (should use ML in real scenario)
        return ticketsEnAttente.size() * Constants.DUREE_MOYENNE_CONSULTATION;
    }

    @Transactional
    public void recalculerTousLesTemps(Long fileAttenteId) {
        log.info("Recalcul des temps d'attente pour la file {}", fileAttenteId);
        FileAttente file = getFileById(fileAttenteId);
        List<Ticket> ticketsEnAttente = ticketRepository.findByFileAttente(file)
                .stream()
                .filter(t -> t.getStatut() == TicketStatus.WAITING)
                .sorted((t1, t2) -> Integer.compare(t2.getScoreTotal(), t1.getScoreTotal()))
                .collect(Collectors.toList());

        for (int i = 0; i < ticketsEnAttente.size(); i++) {
            Ticket t = ticketsEnAttente.get(i);
            t.setPositionActuelle(i + 1);
            t.setTempsAttenteEstime((i + 1) * Constants.DUREE_MOYENNE_CONSULTATION);
            ticketRepository.save(t);
        }

        webSocketService.sendQueueUpdate(fileAttenteId, ticketsEnAttente.size(), calculerTempsAttente(fileAttenteId));
    }
}
