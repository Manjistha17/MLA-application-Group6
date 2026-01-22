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

        // ✅ Generate token BEFORE saving
        String token = UUID.randomUUID().toString();
        user.setEmailVerificationToken(token);
        user.setEmailVerificationExpiry(LocalDateTime.now().plusHours(24));

       // -----------------------------
       // SAVE USER (ONLY INSERT HERE)
       // -----------------------------
       user = userRepository.save(user);

        emailService.sendVerificationEmail(user.getEmail(), token); // async

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

        log.info("User updated: {}", username);
        return userRepository.save(user);
    }

    // -----------------------------
    // FORGOT PASSWORD
    // -----------------------------
    public void forgotPassword(String email) {

        Optional<User> optionalUser = userRepository.findByEmail(email);

        // prevent email enumeration
        if (!optionalUser.isPresent()) {
            log.warn("Forgot password requested for non-existing email");
            return;
        }

        User user = optionalUser.get();

        // check if email is verified
        if (!Boolean.TRUE.equals(user.isEmailVerified())) {
            log.warn("Forgot password requested for unverified email: {}", email);
            return; // silently return
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

}
