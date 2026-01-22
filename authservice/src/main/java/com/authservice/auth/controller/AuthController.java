// // package com.authservice.auth.controller;

// // import com.authservice.auth.dto.ResetPasswordRequest;
// // import com.authservice.auth.model.User;
// // import com.authservice.auth.repository.UserRepository;

// // import java.time.LocalDateTime;
// // import java.util.*;
// // import java.util.regex.Pattern;

// // import org.springframework.beans.factory.annotation.Autowired;
// // import org.springframework.http.HttpStatus;
// // import org.springframework.http.ResponseEntity;
// // import org.springframework.security.crypto.password.PasswordEncoder;
// // import org.springframework.web.bind.annotation.*;

// // import org.springframework.mail.SimpleMailMessage;
// // import org.springframework.mail.javamail.JavaMailSender;

// // @RestController
// // @CrossOrigin(origins = "*", allowedHeaders = "*")
// // @RequestMapping("/api/auth")
// // public class AuthController {

// //     @Autowired
// //     private UserRepository userRepository;

// //     @Autowired
// //     private PasswordEncoder passwordEncoder;

// //     @Autowired(required = false)
// //     private JavaMailSender mailSender;

// //     private static final Pattern EMAIL_REGEX = Pattern.compile("^\\S+@\\S+\\.\\S+$");

// //     // SIGNUP ------------------------------------------------------
// //     @PostMapping("/signup")
// //     public ResponseEntity<?> signup(@RequestBody User incoming) {

// //         if (incoming.getUsername() == null || incoming.getPassword() == null)
// //             return message(HttpStatus.BAD_REQUEST, "Missing username or password");

// //         if (incoming.getUsername().trim().length() < 3)
// //             return message(HttpStatus.BAD_REQUEST, "Username must be at least 3 characters");

// //         if (incoming.getPassword().length() < 6)
// //             return message(HttpStatus.BAD_REQUEST, "Password must be at least 6 characters");

// //     if (userRepository.existsByUsername(incoming.getUsername().trim()))
// //         return message(HttpStatus.CONFLICT, "User already exists");

// //     // UNIQUE EMAIL CHECK
// //     String email = incoming.getEmail();
// //     if (email == null || !EMAIL_REGEX.matcher(email).matches())
// //         return message(HttpStatus.BAD_REQUEST, "Invalid email");
// //     if (userRepository.findByEmail(email) != null)
// //         return message(HttpStatus.CONFLICT, "Email already exists");

// //         User u = new User();
// //         u.setUsername(incoming.getUsername().trim());
// //         u.setPassword(passwordEncoder.encode(incoming.getPassword()));
// //         u.setEmail(incoming.getEmail());
// //         u.setContact(incoming.getContact());
// //         u.setAge(incoming.getAge());
// //         u.setGender(incoming.getGender());
// //         u.setHeight(incoming.getHeight());
// //         u.setWeight(incoming.getWeight());

// //         userRepository.save(u);

// //         return message(HttpStatus.CREATED, "User registered");
// //     }

// //     // LOGIN ------------------------------------------------------
// //     @PostMapping("/login")
// //     public ResponseEntity<?> login(@RequestBody User incoming) {

// //         User existing = userRepository.findByUsername(incoming.getUsername()).orElse(null);
// //         if (existing == null || !passwordEncoder.matches(incoming.getPassword(), existing.getPassword()))
// //             return message(HttpStatus.UNAUTHORIZED, "Invalid credentials");

// //         Map<String,Object> resp = new HashMap<>();
// //         resp.put("username", existing.getUsername());
// //         resp.put("email", existing.getEmail());
// //         resp.put("message", "User authenticated");

// //         return ResponseEntity.ok(resp);
// //     }

// //     // GET USER ---------------------------------------------------
// //     @GetMapping("/user/{username}")
// //     public ResponseEntity<?> getUser(@PathVariable String username) {

// //         User u = userRepository.findByUsername(username).orElse(null);
// //         if (u == null) return message(HttpStatus.NOT_FOUND, "User not found");

// //         return ResponseEntity.ok(u);
// //     }

// //     // UPDATE USER ------------------------------------------------
// //     @PutMapping("/user/{username}")
// //     public ResponseEntity<?> updateUser(@PathVariable String username, @RequestBody User updated) {

// //         User u = userRepository.findByUsername(username).orElse(null);
// //         if (u == null) return message(HttpStatus.NOT_FOUND, "User not found");

// //         u.setContact(updated.getContact());
// //         u.setAge(updated.getAge());
// //         u.setGender(updated.getGender());
// //         u.setHeight(updated.getHeight());
// //         u.setWeight(updated.getWeight());

// //         userRepository.save(u);
// //         return ResponseEntity.ok(u);
// //     }

// //     // FORGOT PASSWORD -------------------------------------------
// //     @PostMapping("/forgotPassword")
// //     public ResponseEntity<?> forgotPassword(@RequestBody Map<String,String> body) {

// //         String email = body.get("email");

// //         if (email == null || !EMAIL_REGEX.matcher(email).matches())
// //             return message(HttpStatus.BAD_REQUEST, "Invalid email");

// //         // FIX: Use list not single return
// //         List<User> users = userRepository.findAllByEmail(email);

// //         if (users == null || users.isEmpty())
// //             return message(HttpStatus.NOT_FOUND, "Email not registered");

// //         User u = users.get(0); // use the first match

// //         String token = UUID.randomUUID().toString();
// //         u.setResetToken(token);
// //         u.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15)); // expires in 15 minutes
// //         userRepository.save(u);

// //         String resetLink = "http://localhost:8081/resetPassword?token=" + token;

// //         if (mailSender != null) {
// //             SimpleMailMessage msg = new SimpleMailMessage();
// //             msg.setTo(email);
// //             msg.setSubject("Password Reset Request");
// //             msg.setText(
// //             "Hello,\n\n" +
// //             "We received a request to reset your password.\n" +
// //             "Please click the link below to set a new password:\n\n" +
// //             resetLink + "\n\n" +
// //             "Note: This link will expire in 15 minutes.\n\n" +
// //             "If you did not request this, you can ignore this email.\n\n" +
// //             "Best regards,\n" +
// //             "Your App Team"
// //         );
// //             mailSender.send(msg);
// //         }

// //         return message(HttpStatus.OK, "Reset link has been emailed");
// //     }

// //     // RESET PASSWORD ---------------------------------------------
// //     @PostMapping("/resetPassword")
// //     public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest req) {

// //         User u = userRepository.findByResetToken(req.getToken());
// //         if (u == null) return message(HttpStatus.BAD_REQUEST, "Invalid or expired token");

// //         u.setPassword(passwordEncoder.encode(req.getNewPassword()));
// //         u.setResetToken(null);

// //         userRepository.save(u);

// //         return message(HttpStatus.OK, "Password reset successfully");
// //     }

// //     // HELPER -----------------------------------------------------
// //     private ResponseEntity<Map<String,String>> message(HttpStatus status, String text) {
// //         Map<String,String> m = new HashMap<>();
// //         m.put("message", text);
// //         return ResponseEntity.status(status).body(m);
// //     }
// // }
// package com.authservice.auth.controller;

// import com.authservice.auth.model.User;
// import com.authservice.auth.service.UserService;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.web.bind.annotation.*;

// @RestController
// @RequestMapping("/api/auth")
// @CrossOrigin(origins = "*")
// public class AuthController {

//     @Autowired
//     private UserService userService;

//     // -----------------------------
//     // SIGNUP
//     // -----------------------------
//     @PostMapping("/signup")
//     public User signup(@RequestBody User user) {
//         return userService.signup(user);
//     }

//     // -----------------------------
//     // LOGIN
//     // -----------------------------
//     @PostMapping("/login")
//     public User login(@RequestBody LoginRequest request) {
//         return userService.login(request.getUsername(), request.getPassword());
//     }

//     // -----------------------------
//     // GET USER
//     // -----------------------------
//     @GetMapping("/user/{username}")
//     public User getUser(@PathVariable String username) {
//         return userService.getUser(username);
//     }

//     // -----------------------------
//     // UPDATE USER
//     // -----------------------------
//     @PutMapping("/user/{username}")
//     public User updateUser(@PathVariable String username, @RequestBody User updated) {
//         return userService.updateUser(username, updated);
//     }

//     // -----------------------------
//     // FORGOT PASSWORD
//     // -----------------------------
//     @PostMapping("/forgotPassword")
//     public String forgotPassword(@RequestBody ForgotPasswordRequest request) {
//         userService.forgotPassword(request.getEmail());
//         return "Password reset link sent if the email is registered.";
//     }

//     // -----------------------------
//     // RESET PASSWORD
//     // -----------------------------
//     @PostMapping("/resetPassword")
//     public String resetPassword(@RequestBody ResetPasswordRequest request) {
//         userService.resetPassword(request.getToken(), request.getNewPassword());
//         return "Password reset successful.";
//     }

//     // -----------------------------------
//     // REQUEST DTO CLASSES
//     // -----------------------------------
//     static class LoginRequest {
//         private String username;
//         private String password;

//         public String getUsername() { return username; }
//         public String getPassword() { return password; }
//     }

//     static class ForgotPasswordRequest {
//         private String email;

//         public String getEmail() { return email; }
//     }

//     static class ResetPasswordRequest {
//         private String token;
//         private String newPassword;

//         public String getToken() { return token; }
//         public String getNewPassword() { return newPassword; }
//     }
// }
package com.authservice.auth.controller;

import com.authservice.auth.dto.request.ForgotPasswordRequest;
import com.authservice.auth.dto.request.LoginRequest;
import com.authservice.auth.dto.request.ResetPasswordRequest;
import com.authservice.auth.dto.request.SignupRequest;
import com.authservice.auth.dto.request.UpdateUserRequest;
import com.authservice.auth.dto.response.GenericResponse;
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
    public User login(@RequestBody LoginRequest request) {
        return userService.login(request.username(), request.password());
    }

    // -----------------------------
    // GET USER
    // -----------------------------
    @GetMapping("/user/{username}")
    public User getUser(@PathVariable String username) {
        return userService.getUser(username);
    }

    // -----------------------------
    // UPDATE USER
    // -----------------------------
    @PutMapping("/user/{username}")
    public User updateUser(@PathVariable String username, @RequestBody UpdateUserRequest request) {
        return userService.updateUser(username, request);
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

}
