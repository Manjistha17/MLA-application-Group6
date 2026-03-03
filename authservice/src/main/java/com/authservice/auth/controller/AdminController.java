package com.authservice.auth.controller;

import com.authservice.auth.dto.response.UserResponse;
import com.authservice.auth.model.User;
import com.authservice.auth.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private UserService userService;

    // Delete a user by username
    @DeleteMapping("/users/{username}")
    public void deleteUser(@PathVariable String username) {
        userService.deleteUser(username);
    }

    // DTO for role update requests
    public static class RoleUpdateRequest {
        private String role;

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }
    }

    // Update a user's role (only "user" or "admin")
    @PutMapping("/users/{username}/role")
    public UserResponse updateUserRole(@PathVariable String username,
                                       @RequestBody RoleUpdateRequest request) {
        String newRole = request.getRole();
        if (!newRole.equalsIgnoreCase("user") && !newRole.equalsIgnoreCase("admin")) {
            throw new IllegalArgumentException("Invalid role. Allowed roles: user, admin");
        }

        User updated = userService.updateUserRole(username, newRole);
        return UserResponse.from(updated);
    }

    // Get all users
    @GetMapping("/users")
    public List<UserResponse> getAllUsers() {
        System.out.println("AdminController: getAllUsers called");
        return userService.getAllUsers()
                          .stream()
                          .map(UserResponse::from)
                          .toList();
    }
}