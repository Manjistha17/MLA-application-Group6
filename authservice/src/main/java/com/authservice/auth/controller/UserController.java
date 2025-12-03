package com.authservice.auth.controller;

import com.authservice.auth.model.User;
import com.authservice.auth.repository.UserRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@Tag(name = "User Details", description = "User information retrieval APIs")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/details/{username}")
    @Operation(summary = "Get user details by username", description = "Retrieve detailed user information")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User found",
            content = @Content(schema = @Schema(implementation = User.class))),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<User> getUserByUsername(
            @Parameter(description = "Username of the user to retrieve")
            @PathVariable String username) {
        return userRepository
                .findByUsername(username)                // Optional<User>
                .map(ResponseEntity::ok)                 // 200 with body
                .orElseGet(() -> ResponseEntity.notFound().build()); // 404
    }
}
