package com.authservice.auth.controller;

import com.authservice.auth.dto.ResetPasswordRequest;
import com.authservice.auth.model.User;
import com.authservice.auth.repository.UserRepository;

import java.util.*;

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

    @Autowired(required = false)
    private JavaMailSender mailSender;

    private static final List<String> VALID_GENDERS =
            Arrays.asList("male", "female", "other", "prefer_not_say");

    // SIGNUP
    @PostMapping("/signup")
    public ResponseEntity<?> register(@RequestBody User incoming) {

        if (incoming.getUsername() == null || incoming.getPassword() == null)
            return ResponseEntity.badRequest().body(message("Missing username or password"));

        if (incoming.getUsername().trim().length() < 3)
            return ResponseEntity.badRequest().body(message("Username must be at least 3 characters"));

        if (incoming.getPassword().length() < 6)
            return ResponseEntity.badRequest().body(message("Password must be at least 6 characters"));

        if (userRepository.existsByUsername(incoming.getUsername().trim()))
            return ResponseEntity.status(HttpStatus.CONFLICT).body(message("User already exists"));

        User u = new User();
        u.setUsername(incoming.getUsername().trim());
        u.setPassword(passwordEncoder.encode(incoming.getPassword()));
        u.setEmail(incoming.getEmail());
        u.setContact(incoming.getContact());
        u.setAge(incoming.getAge());
        u.setGender(incoming.getGender());
        u.setHeight(incoming.getHeight());
        u.setWeight(incoming.getWeight());

        userRepository.save(u);
        return ResponseEntity.status(HttpStatus.CREATED).body(message("User registered"));
    }

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User incoming) {

        User existing = userRepository.findByUsername(incoming.getUsername()).orElse(null);
        if (existing == null)
            return ResponseEntity.status(401).body(message("Invalid credentials"));

        if (!passwordEncoder.matches(incoming.getPassword(), existing.getPassword()))
            return ResponseEntity.status(401).body(message("Invalid credentials"));

        Map<String, Object> resp = new HashMap<>();
        resp.put("message", "User authenticated");
        resp.put("username", existing.getUsername());
        resp.put("email", existing.getEmail());
    @PostMapping("/forgotPassword")
public ResponseEntity<?> forgotPassword(@RequestBody User user) {
    String email = user.getEmail();
    logger.info("Forgot password requested for email: {}", email);

        return ResponseEntity.ok(resp);
    }

    // GET USER BY USERNAME (FIXED)
    @GetMapping("/user/{username}")
    public ResponseEntity<?> getUser(@PathVariable String username) {

        User user = userRepository.findByUsername(username).orElse(null);

 @PostMapping("/resetPassword")
public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
    try {
        // 1️⃣ Find user by the reset token
        User user = userRepository.findByResetToken(request.getToken());
        if (user == null) {
            return ResponseEntity.status(404).body(message("User not found"));
        }

        return ResponseEntity.ok(user);
    }

    // UPDATE USER PROFILE
    @PutMapping("/user/{username}")
    public ResponseEntity<?> updateUser(@PathVariable String username, @RequestBody User updated) {

        User existing = userRepository.findByUsername(username).orElse(null);
        if (existing == null)
            return ResponseEntity.status(404).body(message("User not found"));

        existing.setContact(updated.getContact());
        existing.setAge(updated.getAge());
        existing.setGender(updated.getGender());
        existing.setHeight(updated.getHeight());
        existing.setWeight(updated.getWeight());

        userRepository.save(existing);
        return ResponseEntity.ok(existing);
    }

    // RESET PASSWORD
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest req) {
        User u = userRepository.findByResetToken(req.getToken());
        if (u == null)
            return ResponseEntity.badRequest().body("Invalid token");
        u.setPassword(passwordEncoder.encode(req.getNewPassword()));
        u.setResetToken(null);
        userRepository.save(u);
        return ResponseEntity.ok("Password reset successful");
    }

    private Map<String,String> message(String msg){
        Map<String,String> m = new HashMap<>();
        m.put("message", msg);
        return m;
    }
}
