package com.authservice.auth.controller;

import com.authservice.auth.dto.request.ForgotPasswordRequest;
import com.authservice.auth.dto.request.LoginRequest;
import com.authservice.auth.dto.request.ResetPasswordRequest;
import com.authservice.auth.dto.request.SignupRequest;
import com.authservice.auth.dto.request.UpdateUserRequest;
import com.authservice.auth.dto.request.UsernameRequest;
import com.authservice.auth.dto.response.GenericResponse;
import com.authservice.auth.dto.response.LoginResponse;
import com.authservice.auth.dto.response.UserResponse;
import com.authservice.auth.model.User;
import com.authservice.auth.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;

    // -----------------------------
    // SIGNUP
    // -----------------------------
    @PostMapping("/signup")
    public GenericResponse signup(@RequestBody SignupRequest request) {
        userService.signup(request);
        return new GenericResponse("Signup success");
    }

    // -----------------------------
    // LOGIN
    // -----------------------------
    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        User user = userService.login(request.username(), request.password());
        return LoginResponse.from(user);
    }

    // -----------------------------
    // GET USER
    // -----------------------------
    @GetMapping("/user/{username}")
    public UserResponse getUser(@PathVariable String username) {
        User user = userService.getUser(username);
        return UserResponse.from(user);
    }

    // -----------------------------
    // UPDATE USER
    // -----------------------------
    @PutMapping("/user/{username}")
    public UserResponse updateUser(@PathVariable String username, @RequestBody UpdateUserRequest request) {
        User updatedUser = userService.updateUser(username, request);
        return UserResponse.from(updatedUser);
    }

    // -----------------------------
    // FORGOT PASSWORD
    // -----------------------------
    @PostMapping("/forgotPassword")
    public GenericResponse forgotPassword(@RequestBody ForgotPasswordRequest request) {
        userService.forgotPassword(request.email());
        return new GenericResponse("Password reset link sent if the email is registered.");
    }

    // -----------------------------
    // RESET PASSWORD
    // -----------------------------
    @PostMapping("/resetPassword")
    public GenericResponse resetPassword(@RequestBody ResetPasswordRequest request) {
        userService.resetPassword(request.token(), request.newPassword());
        return new GenericResponse("Password reset successful.");
    }

    // -----------------------------
    // VERIFY EMAIL
    // -----------------------------
    @GetMapping("/verify-email")
    public GenericResponse verifyEmail(@RequestParam String token) {
        userService.verifyEmail(token);
        return new GenericResponse("Email verified successfully");
    }

    // -----------------------------
    // RESEND VERIFICATION EMAIL
    // -----------------------------
    @PostMapping("/resend-verification")
    public GenericResponse resendVerification(@RequestBody UsernameRequest request) {
        // Fetch username from request
        String username = request.username();

        // Send verification email
        userService.sendVerificationEmailToUser(username);

        return new GenericResponse("Verification email sent. Please check your inbox.");
    }

}
