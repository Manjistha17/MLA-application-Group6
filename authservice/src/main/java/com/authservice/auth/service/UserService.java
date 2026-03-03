package com.authservice.auth.service;

import com.authservice.auth.dto.request.SignupRequest;
import com.authservice.auth.dto.request.UpdateUserRequest;
import com.authservice.auth.exception.*;
import com.authservice.auth.model.User;
import com.authservice.auth.repository.UserRepository;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import java.util.List;

@Service
@Slf4j
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired
    private EmailService emailService;

    private static final String RESET_PASSWORD_LINK =
            "http://localhost:8081/resetPassword?token=";

    // -----------------------------
    // SIGNUP
    // -----------------------------
    public User signup(SignupRequest req) {
        if (req.username() == null || req.password() == null)
            throw new IllegalArgumentException("Username and password are required");

        if (req.username().trim().length() < 3)
            throw new IllegalArgumentException("Username must be at least 3 characters");

        if (req.password().length() < 6)
            throw new IllegalArgumentException("Password must be at least 6 characters");

        if (userRepository.existsByUsername(req.username().trim()))
            throw new UserAlreadyExistsException("Username already exists");

        if (req.email() == null || !req.email().matches("^\\S+@\\S+\\.\\S+$"))
            throw new IllegalArgumentException("Invalid email format");

        if (userRepository.findByEmail(req.email()).isPresent())
            throw new UserAlreadyExistsException("Email already exists");

        User user = new User();
        user.setUsername(req.username().trim());
        user.setPassword(passwordEncoder.encode(req.password()));
        user.setEmail(req.email());
        user.setContact(req.contact());
        user.setAge(req.age());
        user.setGender(req.gender());
        user.setHeight(req.height());
        user.setWeight(req.weight());
        user.setEmailVerified(false);
        user.setRole("user");

        // Generate token BEFORE saving
        String token = UUID.randomUUID().toString();
        user.setEmailVerificationToken(token);
        user.setEmailVerificationExpiry(LocalDateTime.now().plusHours(24));

        // Save user
        user = userRepository.save(user);

        // Send verification email asynchronously
        emailService.sendVerificationEmail(user.getEmail(), token);

        log.info("User registered: {}", user.getUsername());
        return user;
    }

    // -----------------------------
    // LOGIN
    // -----------------------------
    public User login(String username, String password) {
        User user = userRepository.findByUsername(username.trim())
                .orElseThrow(() ->
                        new InvalidCredentialsException("Invalid username or password"));

        if (!passwordEncoder.matches(password, user.getPassword()))
            throw new InvalidCredentialsException("Invalid username or password");

        log.info("User logged in: {}", username);
        return user;
    }

    // -----------------------------
    // GET USER
    // -----------------------------
    public User getUser(String username) {
        return userRepository.findByUsername(username.trim())
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));
    }

    // -----------------------------
    // UPDATE USER
    // -----------------------------
    public User updateUser(String username, UpdateUserRequest req) {
        User user = getUser(username);

        user.setContact(req.contact());
        user.setAge(req.age());
        user.setGender(req.gender());
        user.setHeight(req.height());
        user.setWeight(req.weight());

        // Update email if changed
        if (req.email() != null && !req.email().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.findByEmail(req.email()).isPresent()) {
                throw new UserAlreadyExistsException("Email already exists");
            }

            user.setEmail(req.email());
            user.setEmailVerified(false);

            String token = UUID.randomUUID().toString();
            user.setEmailVerificationToken(token);
            user.setEmailVerificationExpiry(LocalDateTime.now().plusHours(24));

            user = userRepository.save(user);

            log.info("User updated: {}", username);

            // Send verification email asynchronously
            emailService.sendVerificationEmail(user.getEmail(), token);
        }

        return user;
    }

    // -----------------------------
    // FORGOT PASSWORD
    // -----------------------------
    public void forgotPassword(String email) {
        Optional<User> optionalUser = userRepository.findByEmail(email);

        // Prevent email enumeration
        if (!optionalUser.isPresent()) {
            log.warn("Forgot password requested for non-existing email");
            return;
        }

        User user = optionalUser.get();

        // Check if email is verified
        if (!Boolean.TRUE.equals(user.isEmailVerified())) {
            log.warn("Forgot password requested for unverified email: {}", email);
            return;
        }

        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        if (mailSender != null) {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(email);
            msg.setSubject("Password Reset Request");
            msg.setText("""
                    Hello,

                    Reset your password using the link below:
                    %s%s

                    This link expires in 15 minutes.
                    If you did not request this, ignore this email.
                    """.formatted(RESET_PASSWORD_LINK, token));

            mailSender.send(msg);
        }

        log.info("Password reset token generated");
    }

    // -----------------------------
    // RESET PASSWORD
    // -----------------------------
    public void resetPassword(String token, String newPassword) {
        if (newPassword == null || newPassword.length() < 6)
            throw new IllegalArgumentException("Password must be at least 6 characters");

        User user = userRepository.findByResetToken(token)
                .orElseThrow(() ->
                        new InvalidTokenException("Invalid reset token"));

        if (user.getResetTokenExpiry() == null ||
                user.getResetTokenExpiry().isBefore(LocalDateTime.now()))
            throw new TokenExpiredException("Reset token has expired");

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);

        userRepository.save(user);
        log.info("Password reset successful for user: {}", user.getUsername());
    }

    // -----------------------------
    // VERIFY EMAIL
    // -----------------------------
    public void verifyEmail(String token) {
        User user = userRepository.findByEmailVerificationToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        if (user.getEmailVerificationExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token expired");
        }

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailVerificationExpiry(null);

        userRepository.save(user);
    }

    // -----------------------------
    // RESEND VERIFICATION EMAIL
    // -----------------------------
    public void sendVerificationEmailToUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (Boolean.TRUE.equals(user.isEmailVerified())) {
            throw new IllegalStateException("Email is already verified.");
        }

        String token = UUID.randomUUID().toString();
        user.setEmailVerificationToken(token);
        user.setEmailVerificationExpiry(LocalDateTime.now().plusHours(24));

        userRepository.save(user);

        emailService.sendVerificationEmail(user.getEmail(), token);

        log.info("Verification email sent to {}", user.getEmail());
    }

    // -----------------------------
    // ADMIN OPERATIONS
    // -----------------------------
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void deleteUser(String username) {
        User user = getUser(username);
        userRepository.delete(user);
    }

    public User updateUserRole(String username, String newRole) {
    User user = getUser(username);

    String normalizedRole = newRole.toLowerCase();
    if (!normalizedRole.equals("admin") && !normalizedRole.equals("user")) {
        throw new IllegalArgumentException("Invalid role: " + newRole);
    }

    // Prevent removing the last admin
    if (user.getRole().equals("admin") && normalizedRole.equals("user")) {
        long adminCount = userRepository.countByRole("admin");
        if (adminCount <= 1) {
            throw new IllegalStateException("Cannot demote the last admin");
        }
    }

    user.setRole(normalizedRole);
    return userRepository.save(user);
}
}