package com.authservice.auth.dto.request;

public record UpdateUserRequest(
        String contact,
        Integer age,
        String gender,
        Double height,
        Double weight
) {}

