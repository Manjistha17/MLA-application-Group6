package com.authservice.auth.dto.response;

import com.authservice.auth.model.User;

public record LoginResponse(
        String username,
        String email,
        String role,
        boolean emailVerified,
        String message
) {

    // Convenience constructor
    public LoginResponse(String username, String email, String role, boolean emailVerified) {
        this(username, email, role, emailVerified, "Login successful");
    }

    // Static factory method to convert User entity → LoginResponse
    public static LoginResponse from(User user) {
        return new LoginResponse(
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.isEmailVerified()
        );
    }
}