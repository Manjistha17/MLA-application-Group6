package com.authservice.auth.dto.response;

import com.authservice.auth.model.User;

public record LoginResponse(
        String username,
        String email,
        String message,
        boolean emailVerified
) {

    public LoginResponse(String username, String email, boolean emailVerified) {
        this(username, email, "Login successful", emailVerified);
    }

    // Static factory method to convert User entity → LoginResponse
    public static LoginResponse from(User user) {
        return new LoginResponse(
                user.getUsername(),
                user.getEmail(),
                user.isEmailVerified()
        );
    }
}
