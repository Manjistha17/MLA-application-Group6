package com.authservice.auth.dto.response;

public record LoginResponse(
        String username,
        String email,
        String message
) {
    public LoginResponse(String username, String email) {
        this(username, email, "Login successful");
    }
}

