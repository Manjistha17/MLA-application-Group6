package com.authservice.auth.controller;

import com.authservice.auth.dto.ResetPasswordRequest;
import com.authservice.auth.model.User;
import com.authservice.auth.repository.UserRepository;

import java.util.*;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*")
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Authentication and user management APIs")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    private static final Pattern EMAIL_REGEX = Pattern.compile("^\\S+@\\S+\\.\\S+$");

    // SIGNUP ------------------------------------------------------
    @Operation(summary = "Register a new user", description = "Create a new user account with username, password, email and profile information")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "User registered successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "409", description = "User already exists")
    })
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User incoming) {

        if (incoming.getUsername() == null || incoming.getPassword() == null)
            return message(HttpStatus.BAD_REQUEST, "Missing username or password");

        if (incoming.getUsername().trim().length() < 3)
            return message(HttpStatus.BAD_REQUEST, "Username must be at least 3 characters");

        if (incoming.getPassword().length() < 6)
            return message(HttpStatus.BAD_REQUEST, "Password must be at least 6 characters");

    if (userRepository.existsByUsername(incoming.getUsername().trim()))
        return message(HttpStatus.CONFLICT, "User already exists");

    // UNIQUE EMAIL CHECK
    String email = incoming.getEmail();
    if (email == null || !EMAIL_REGEX.matcher(email).matches())
        return message(HttpStatus.BAD_REQUEST, "Invalid email");
    if (userRepository.findByEmail(email) != null)
        return message(HttpStatus.CONFLICT, "Email already exists");

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

        return message(HttpStatus.CREATED, "User registered");
    }

    // LOGIN ------------------------------------------------------
    @Operation(summary = "Authenticate user", description = "Login with username and password to authenticate")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User authenticated successfully"),
        @ApiResponse(responseCode = "401", description = "Invalid credentials")
    })
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User incoming) {

        User existing = userRepository.findByUsername(incoming.getUsername()).orElse(null);
        if (existing == null || !passwordEncoder.matches(incoming.getPassword(), existing.getPassword()))
            return message(HttpStatus.UNAUTHORIZED, "Invalid credentials");

        Map<String,Object> resp = new HashMap<>();
        resp.put("username", existing.getUsername());
        resp.put("email", existing.getEmail());
        resp.put("message", "User authenticated");

        return ResponseEntity.ok(resp);
    }

    // GET USER ---------------------------------------------------
    @Operation(summary = "Get user by username", description = "Retrieve user information by username")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User found", content = @Content(schema = @Schema(implementation = User.class))),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/user/{username}")
    public ResponseEntity<?> getUser(@PathVariable String username) {

        User u = userRepository.findByUsername(username).orElse(null);
        if (u == null) return message(HttpStatus.NOT_FOUND, "User not found");

        return ResponseEntity.ok(u);
    }

    // UPDATE USER ------------------------------------------------
    @Operation(summary = "Update user profile", description = "Update user profile information (contact, age, gender, height, weight)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User updated successfully", content = @Content(schema = @Schema(implementation = User.class))),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PutMapping("/user/{username}")
    public ResponseEntity<?> updateUser(@PathVariable String username, @RequestBody User updated) {

        User u = userRepository.findByUsername(username).orElse(null);
        if (u == null) return message(HttpStatus.NOT_FOUND, "User not found");

        u.setContact(updated.getContact());
        u.setAge(updated.getAge());
        u.setGender(updated.getGender());
        u.setHeight(updated.getHeight());
        u.setWeight(updated.getWeight());

        userRepository.save(u);
        return ResponseEntity.ok(u);
    }

    // FORGOT PASSWORD -------------------------------------------
    @Operation(summary = "Request password reset", description = "Send a password reset link to the user's email")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Reset link sent successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid email"),
        @ApiResponse(responseCode = "404", description = "Email not registered")
    })
    @PostMapping("/forgotPassword")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String,String> body) {

        String email = body.get("email");

        if (email == null || !EMAIL_REGEX.matcher(email).matches())
            return message(HttpStatus.BAD_REQUEST, "Invalid email");

        // FIX: Use list not single return
        List<User> users = userRepository.findAllByEmail(email);

        if (users == null || users.isEmpty())
            return message(HttpStatus.NOT_FOUND, "Email not registered");

        User u = users.get(0); // use the first match

        String token = UUID.randomUUID().toString();
        u.setResetToken(token);
        userRepository.save(u);

        String resetLink = "http://localhost:8081/resetPassword?token=" + token;

        if (mailSender != null) {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(email);
            msg.setSubject("Password Reset Request");
            msg.setText("Click here to reset your password:\n" + resetLink);
            mailSender.send(msg);
        }

        return message(HttpStatus.OK, "Reset link has been emailed");
    }

    // RESET PASSWORD ---------------------------------------------
    @Operation(summary = "Reset password", description = "Reset user password using a valid reset token")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Password reset successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid or expired token")
    })
    @PostMapping("/resetPassword")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest req) {

        User u = userRepository.findByResetToken(req.getToken());
        if (u == null) return message(HttpStatus.BAD_REQUEST, "Invalid or expired token");

        u.setPassword(passwordEncoder.encode(req.getNewPassword()));
        u.setResetToken(null);

        userRepository.save(u);

        return message(HttpStatus.OK, "Password reset successfully");
    }

    // HELPER -----------------------------------------------------
    private ResponseEntity<Map<String,String>> message(HttpStatus status, String text) {
        Map<String,String> m = new HashMap<>();
        m.put("message", text);
        return ResponseEntity.status(status).body(m);
    }
}