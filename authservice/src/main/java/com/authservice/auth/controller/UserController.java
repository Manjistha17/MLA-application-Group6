package com.authservice.auth.controller;

import com.authservice.auth.model.User;
import com.authservice.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/user/{username}")
    public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
        return userRepository
                .findByUsername(username)                // Optional<User>
                .map(ResponseEntity::ok)                 // 200 with body
                .orElseGet(() -> ResponseEntity.notFound().build()); // 404
    }
}
