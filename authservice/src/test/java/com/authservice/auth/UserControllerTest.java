package com.authservice.auth.controller;

import com.authservice.auth.model.User;
import com.authservice.auth.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserController userController;

    // Test: User exists will return 200 + profile details
    @Test
    void shouldReturnUserDetails_whenUserExists() {
        User user = new User();
        user.setUsername("manji");
        user.setEmail("manji@example.com");

        when(userRepository.findByUsername("manji"))
                .thenReturn(Optional.of(user));

        ResponseEntity<User> response = userController.getUserByUsername("manji");

        assertEquals(200, response.getStatusCodeValue());
        assertEquals("manji@example.com", response.getBody().getEmail());
        verify(userRepository, times(1)).findByUsername("manji");
    }

    // Test: User not found will return 404
    @Test
    void shouldReturn404_whenUserNotFound() {
        when(userRepository.findByUsername("manji"))
                .thenReturn(Optional.empty());

        ResponseEntity<User> response = userController.getUserByUsername("manji");

        assertEquals(404, response.getStatusCodeValue());
        assertNull(response.getBody());
    }
}
