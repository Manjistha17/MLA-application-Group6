package com.authservice.auth.dto.response;

public record UserResponse(
        String username,
        String email,
        String contact,
        Integer age,
        String gender,
        Double height,
        Double weight
) {}

