package com.authservice.auth.dto.request;

public record LoginRequest(
        String username,
        String password
) {}
