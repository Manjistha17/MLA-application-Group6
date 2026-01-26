package com.authservice.auth.dto.request;

public record UpdateUserRequest(
        String email,
        String contact,
        Integer age,
        String gender,
        Double height,
        Double weight
) {}

