package com.carepulse.carepulse.integration;

import com.carepulse.carepulse.dto.response.MLStatusResponse;
import com.carepulse.carepulse.util.Constants;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Collections;
import java.util.Map;

import java.time.Duration;

@Service
@Slf4j
public class MLServiceClient {

    private final WebClient webClient;
    private final com.carepulse.carepulse.repository.ParametreSystemeRepository parametreSystemeRepository;

    public MLServiceClient(WebClient.Builder webClientBuilder, com.carepulse.carepulse.repository.ParametreSystemeRepository parametreSystemeRepository) {
        this.webClient = webClientBuilder.baseUrl(com.carepulse.carepulse.util.Constants.ML_SERVICE_URL).build();
        this.parametreSystemeRepository = parametreSystemeRepository;
    }

    public WaitTimeResponse predictWaitTime(WaitTimeRequest request) {
        log.info("Appel ML pour prédiction temps d'attente");
        return webClient.post()
                .uri("/predict/wait-time")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(WaitTimeResponse.class)
                .timeout(Duration.ofSeconds(5))
                .onErrorResume(e -> {
                    log.error("Erreur ML predictWaitTime, utilisation fallback: {}", e.getMessage());
                    return Mono.just(WaitTimeResponse.builder()
                            .tempsAttenteMinutes(15)
                            .nbSamples(0)
                            .type("FALLBACK")
                            .build());
                })
                .block();
    }

    public NoShowResponse predictNoShow(NoShowRequest request) {
        log.info("Appel ML pour prédiction No-Show");
        return webClient.post()
                .uri("/predict/no-show")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(NoShowResponse.class)
                .timeout(Duration.ofSeconds(5))
                .onErrorResume(e -> {
                    log.error("Erreur ML predictNoShow, utilisation fallback: {}", e.getMessage());
                    return Mono.just(NoShowResponse.builder()
                            .scoreNoShow(0.0)
                            .risqueEleve(false)
                            .nbSamples(0)
                            .type("FALLBACK")
                            .build());
                })
                .block();
    }


    public MLStatusResponse getStatus() {
        log.info("Récupération du statut du service ML");
        return webClient.get()
                .uri("/health")
                .retrieve()
                .bodyToMono(MLStatusResponse.class)
                .timeout(Duration.ofSeconds(2))
                .onErrorResume(e -> {
                    log.error("Service ML hors ligne : {}", e.getMessage());
                    return Mono.just(MLStatusResponse.builder()
                            .serviceActif(false)
                            .modeles(Collections.emptyList())
                            .precisionMoyenne(0)
                            .build());
                })
                .block();
    }

    public Map<String, Object> triggerTraining() {
        log.info("Déclenchement de l'entraînement ML");
        return webClient.post()
                .uri("/train")
                .retrieve()
                .bodyToMono(Map.class)
                .timeout(Duration.ofSeconds(30))
                .map(response -> {
                    if ("success".equals(response.get("status"))) {
                        log.info("Entraînement ML réussi, activation du moteur ML");
                        parametreSystemeRepository.findByCle("moteur_ml").ifPresent(p -> {
                            p.setValeur("true");
                            parametreSystemeRepository.save(p);
                        });
                    }
                    return response;
                })
                .onErrorResume(e -> {
                    log.error("Erreur lors du training ML : {}", e.getMessage());
                    return Mono.just(Map.of("status", "error", "message", "Service ML indisponible"));
                })
                .block();
    }
}
