package com.carepulse.carepulse.service;

import com.carepulse.carepulse.entity.Ticket;
import com.carepulse.carepulse.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.internet.MimeMessage;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    public void envoyerConfirmationTicket(Ticket ticket) {
        log.info("Envoi email de confirmation pour le ticket {}", ticket.getNumeroTicket());
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "UTF-8");
            
            Context context = new Context();
            context.setVariable("numeroTicket", ticket.getNumeroTicket());
            context.setVariable("position", ticket.getPositionActuelle());
            context.setVariable("tempsEstime", ticket.getTempsAttenteEstime());
            
            String htmlContent = templateEngine.process("confirmation-ticket", context);
            
            helper.setTo(ticket.getPatient().getUser().getEmail());
            helper.setSubject("Confirmation de votre ticket - CarePulse");
            helper.setText(htmlContent, true);
            
            mailSender.send(mimeMessage);
        } catch (Exception e) {
            log.error("Erreur lors de l'envoi de l'email: {}", e.getMessage());
        }
    }

    public void envoyerBienvenue(User user) {
        log.info("Envoi email de bienvenue à {}", user.getEmail());
        // Logic similar to confirmation email
    }
}
