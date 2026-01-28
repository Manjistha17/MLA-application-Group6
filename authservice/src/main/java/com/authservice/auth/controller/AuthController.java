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
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Authentication and user management APIs")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;

    // -----------------------------
    // SIGNUP
    // -----------------------------
    @Operation(summary = "Register a new user", description = "Create a new user account with username, password, email and profile information")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "User registered successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "409", description = "User already exists")
    })
    @PostMapping("/signup")
    public GenericResponse signup(@RequestBody SignupRequest request) {
        userService.signup(request);
        return new GenericResponse("Signup success");
    }

    // -----------------------------
    // LOGIN
    // -----------------------------
    @Operation(summary = "Authenticate user", description = "Login with username and password to authenticate")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User authenticated successfully"),
        @ApiResponse(responseCode = "401", description = "Invalid credentials")
    })
    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        User user = userService.login(request.username(), request.password());
        return LoginResponse.from(user);
    }

    // -----------------------------
    // GET USER
    // -----------------------------
    @Operation(summary = "Get user by username", description = "Retrieve user information by username")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User found", content = @Content(schema = @Schema(implementation = User.class))),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/user/{username}")
    public UserResponse getUser(@PathVariable String username) {
        User user = userService.getUser(username);
        return UserResponse.from(user);
    }

    // -----------------------------
    // UPDATE USER
    // -----------------------------
    @Operation(summary = "Update user profile", description = "Update user profile information (contact, age, gender, height, weight)")
      @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User updated successfully", content = @Content(schema = @Schema(implementation = User.class))),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PutMapping("/user/{username}")
    public UserResponse updateUser(@PathVariable String username, @RequestBody UpdateUserRequest request) {
        User updatedUser = userService.updateUser(username, request);
        return UserResponse.from(updatedUser);
    }

    // -----------------------------
    // FORGOT PASSWORD
    // -----------------------------
    @Operation(summary = "Request password reset", description = "Send a password reset link to the user's email")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Reset link sent successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid email"),
        @ApiResponse(responseCode = "404", description = "Email not registered")
        })
    @PostMapping("/forgotPassword")
    public GenericResponse forgotPassword(@RequestBody ForgotPasswordRequest request) {
        userService.forgotPassword(request.email());
        return new GenericResponse("Password reset link sent if the email is registered.");
    }

    // -----------------------------
    // RESET PASSWORD
    // -----------------------------
    @Operation(summary = "Reset password", description = "Reset user password using a valid reset token")
     @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Password reset successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid or expired token")
    })
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
