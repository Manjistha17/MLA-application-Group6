package com.authservice.auth.dto.response;

import com.authservice.auth.model.User;

public record UserResponse(
        String username,
        String email,
        String contact,
        Integer age,
        String gender,
        Double height,
        Double weight,
        boolean emailVerified
) {
    // Static factory method to convert User entity → UserResponse
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getUsername(),
                user.getEmail(),
                user.getContact(),
                user.getAge(),
                user.getGender(),
                user.getHeight(),
                user.getWeight(),
                user.isEmailVerified()
        );
    }
}
