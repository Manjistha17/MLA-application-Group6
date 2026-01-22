package com.authservice.auth.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    /**
     * Sends a verification email asynchronously.
     * @param email Recipient email
     * @param token Verification token
     */
    @Async
    public void sendVerificationEmail(String email, String token) {

        if (mailSender == null) {
            log.warn("MailSender not configured. Verification email skipped for {}", email);
            return;
        }

        try {
            String link = "http://localhost:8081/verify-email?token=" + token;

            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(email);
            msg.setSubject("Verify your email");
            msg.setText(
                "Hello,\n\n" +
                "Please verify your email by clicking the link below:\n\n" +
                link + "\n\n" +
                "This link will expire in 24 hours.\n\n" +
                "If you did not create this account, please ignore this email."
            );

            mailSender.send(msg);
            log.info("Verification email sent to {}", email);

        } catch (Exception ex) {
            log.error("Failed to send verification email to {}", email, ex);
        }
    }
}
