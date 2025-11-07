package com.authservice.auth.controller;

import com.authservice.auth.model.User;
import com.authservice.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.regex.Pattern;

@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*")
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

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

    // helper to produce Map<String,String> compatible with Java 8
    private Map<String, String> singleMessage(String msg) {
        Map<String, String> m = new HashMap<>();
        m.put("message", msg);
        return m;
    }
}