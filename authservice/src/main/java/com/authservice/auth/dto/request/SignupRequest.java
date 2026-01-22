package com.authservice.auth.dto.request;

public record SignupRequest(
        String username,
        String password,
        String email,
        String contact,
        Integer age,
        String gender,
        Double height,
        Double weight
 ) {}

