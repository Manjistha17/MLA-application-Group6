package com.authservice.auth.controller;

import com.authservice.auth.model.User;
import com.authservice.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@Tag(name = "User", description = "User details management APIs")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Operation(summary = "Get user details", description = "Retrieve detailed user information by username")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User found", content = @Content(schema = @Schema(implementation = User.class))),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/details/{username}")
    public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
        return userRepository
                .findByUsername(username)                // Optional<User>
                .map(ResponseEntity::ok)                 // 200 with body
                .orElseGet(() -> ResponseEntity.notFound().build()); // 404
    }
}
