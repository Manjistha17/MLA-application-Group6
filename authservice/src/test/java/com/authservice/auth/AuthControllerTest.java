package com.authservice.auth.controller;

import com.authservice.auth.model.User;
import com.authservice.auth.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.mail.javamail.JavaMailSender;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private AuthController authController;

    @Test
    void testSignupSuccess() {
        // Arrange
        User user = new User();
        user.setUsername("john123");
        user.setPassword("securePass123");
        user.setEmail("john@example.com");

        when(userRepository.existsByUsername("john123")).thenReturn(false);
        when(userRepository.findByEmail("john@example.com")).thenReturn(null);
        when(passwordEncoder.encode("securePass123")).thenReturn("encodedPass");

        // Act
        ResponseEntity<?> response = authController.signup(user);

        // Assert
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals("User registered",
                ((Map<?, ?>) response.getBody()).get("message"));
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testLoginInvalidCredentials() {
        // Arrange
        User user = new User();
        user.setUsername("john123");
        user.setPassword("wrongPass");

        User existingUser = new User();
        existingUser.setUsername("john123");
        existingUser.setPassword("encodedPass");

        when(userRepository.findByUsername("john123")).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches("wrongPass", "encodedPass")).thenReturn(false);

        // Act
        ResponseEntity<?> response = authController.login(user);

        // Assert
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("Invalid credentials",
                ((Map<?, ?>) response.getBody()).get("message"));
    }
}