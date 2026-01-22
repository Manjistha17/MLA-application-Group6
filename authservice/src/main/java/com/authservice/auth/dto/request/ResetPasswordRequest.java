package com.authservice.auth.dto.request;

public record ResetPasswordRequest(
        String token,
        String newPassword
) {}
