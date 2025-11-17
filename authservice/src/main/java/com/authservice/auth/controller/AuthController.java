package com.authservice.auth.controller;

import com.authservice.auth.dto.ResetPasswordRequest;
import com.authservice.auth.model.User;
// import com.authservice.auth.dto.ForgotPasswordRequest;
import com.authservice.auth.repository.UserRepository;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*")
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JavaMailSender mailSender;  // ✅ enable in config

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            return ResponseEntity.badRequest().body("User already exists - please log in");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully!");
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody User user) {
        User existingUser = userRepository.findByUsername(user.getUsername());

        if (existingUser != null && passwordEncoder.matches(user.getPassword(), existingUser.getPassword())) {
            return ResponseEntity.ok("User authenticated");
        } else {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    } 

    @PostMapping("/forgot-password")
public ResponseEntity<?> forgotPassword(@RequestBody User user) {
    String email = user.getEmail();
    logger.info("Forgot password requested for email: {}", email);

    User existingUser = userRepository.findByEmail(email);
    if (existingUser == null) {
        logger.info("User not found for email: {}", email);
        return ResponseEntity.status(404).body("User not found");
    }

    String token = UUID.randomUUID().toString();
    existingUser.setResetToken(token);
    userRepository.save(existingUser);

    // String resetLink = "http://localhost:8080/reset-password?token=" + token;
    String resetLink = "http://localhost:8081/resetPassword?token=" + token;
    logger.info("Password reset link: {}", resetLink);

    SimpleMailMessage message = new SimpleMailMessage();
    message.setTo(email);
    message.setSubject("Password Reset Request");
    message.setText("Hi " + existingUser.getUsername() + ",\n\n"
            + "Click the link below to reset your password:\n"
            + resetLink + "\n\n"
            + "If you did not request this, please ignore this email.\n\n"
            + "Thanks!");
    mailSender.send(message);

    return ResponseEntity.ok("Password reset link sent to your email!");
}


 @PostMapping("/reset-password")
public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
    try {
        // 1️⃣ Find user by the reset token
        User user = userRepository.findByResetToken(request.getToken());
        if (user == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                 .body("Invalid or expired token");
        }

        // 2️⃣ Update the password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null); // clear the token after use
        userRepository.save(user);

        // 3️⃣ Return success
        return ResponseEntity.ok("Password reset successfully");

    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                             .body("Something went wrong while resetting the password");
    }
}

}
