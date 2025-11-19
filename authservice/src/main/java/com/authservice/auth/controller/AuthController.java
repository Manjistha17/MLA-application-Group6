package com.authservice.auth.controller;

import com.authservice.auth.dto.ResetPasswordRequest;
import com.authservice.auth.model.User;
// import com.authservice.auth.dto.ForgotPasswordRequest;
import com.authservice.auth.repository.UserRepository;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.regex.Pattern;
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

    private static final Pattern EMAIL_REGEX = Pattern.compile("^\\S+@\\S+\\.\\S+$");
    private static final Pattern CONTACT_REGEX = Pattern.compile("^\\d{7,15}$");

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody User incoming) {
        if (incoming == null
                || incoming.getUsername() == null
                || incoming.getPassword() == null) {
            return ResponseEntity.badRequest().body(singleMessage("Missing username or password"));
        }

        String username = incoming.getUsername().trim();
        String rawPassword = incoming.getPassword();

        if (username.length() < 3) {
            return ResponseEntity.badRequest().body(singleMessage("Username must be at least 3 characters"));
        }
        if (rawPassword.length() < 6) {
            return ResponseEntity.badRequest().body(singleMessage("Password must be at least 6 characters"));
        }

        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(singleMessage("User already exists - please log in"));
        }

        // optional field validations
        if (incoming.getEmail() != null && !EMAIL_REGEX.matcher(incoming.getEmail().trim()).matches()) {
            return ResponseEntity.badRequest().body(singleMessage("Invalid email format"));
        }
        if (incoming.getContact() != null && !CONTACT_REGEX.matcher(incoming.getContact().trim()).matches()) {
            return ResponseEntity.badRequest().body(singleMessage("Contact must be 7-15 digits"));
        }
        if (incoming.getAge() != null) {
            int age = incoming.getAge();
            if (age <= 0 || age > 120) {
                return ResponseEntity.badRequest().body(singleMessage("Enter a valid age (1-120)"));
            }
        }
        if (incoming.getHeight() != null) {
            double h = incoming.getHeight();
            if (h <= 0 || h > 300) {
                return ResponseEntity.badRequest().body(singleMessage("Enter valid height in cm"));
            }
        }
        if (incoming.getWeight() != null) {
            double w = incoming.getWeight();
            if (w <= 0 || w > 500) {
                return ResponseEntity.badRequest().body(singleMessage("Enter valid weight in kg"));
            }
        }
        if (incoming.getGender() != null) {
            String g = incoming.getGender().trim().toLowerCase();
            if (!Arrays.asList("male", "female", "other", "prefer_not_say").contains(g)) {
                return ResponseEntity.badRequest().body(singleMessage("Invalid gender value"));
            }
        }

        // create new User and copy only allowed fields
        User userToSave = new User();
        userToSave.setUsername(username);
        userToSave.setPassword(passwordEncoder.encode(rawPassword));

        if (Objects.nonNull(incoming.getEmail())) userToSave.setEmail(incoming.getEmail().trim());
        if (Objects.nonNull(incoming.getContact())) userToSave.setContact(incoming.getContact().trim());
        if (Objects.nonNull(incoming.getAge())) userToSave.setAge(incoming.getAge());
        if (Objects.nonNull(incoming.getGender())) userToSave.setGender(incoming.getGender().trim());
        if (Objects.nonNull(incoming.getHeight())) userToSave.setHeight(incoming.getHeight());
        if (Objects.nonNull(incoming.getWeight())) userToSave.setWeight(incoming.getWeight());

        userRepository.save(userToSave);

        return ResponseEntity.status(HttpStatus.CREATED).body(singleMessage("User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody User incoming) {
        if (incoming == null || incoming.getUsername() == null || incoming.getPassword() == null) {
            return ResponseEntity.badRequest().body(singleMessage("Missing username or password"));
        }

        User existingUser = userRepository.findByUsername(incoming.getUsername().trim()).orElse(null);
        if (existingUser != null && passwordEncoder.matches(incoming.getPassword(), existingUser.getPassword())) {
            return ResponseEntity.ok(singleMessage("User authenticated"));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(singleMessage("Invalid credentials"));
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


    // helper to produce Map<String,String> compatible with Java 8
    private Map<String, String> singleMessage(String msg) {
        Map<String, String> m = new HashMap<>();
        m.put("message", msg);
        return m;
    }
}