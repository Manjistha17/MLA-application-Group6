package com.authservice.auth.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Document(collection = "users")
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String username;

    @JsonIgnore
    private String password;

    @Indexed(unique = true)
    private String email;

    private String contact;
    private Integer age;
    private String gender;
    private Double height;
    private Double weight;

    // Role-based segregation
    private String role = "user"; // default role

    @JsonIgnore
    private String resetToken;

    @JsonIgnore
    private LocalDateTime resetTokenExpiry;

    @JsonIgnore
    private String emailVerificationToken;

    @JsonIgnore
    private LocalDateTime emailVerificationExpiry;

    private boolean emailVerified;

    // -----------------------------
    // Constructors
    // -----------------------------
    public User() {}

    public User(String username, String password, String email, String contact,
                Integer age, String gender, Double height, Double weight, String role) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.contact = contact;
        this.age = age;
        this.gender = gender;
        this.height = height;
        this.weight = weight;
        this.role = role;
    }

    // -----------------------------
    // Getters and Setters
    // -----------------------------
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    @JsonIgnore
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public Double getHeight() { return height; }
    public void setHeight(Double height) { this.height = height; }

    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    @JsonIgnore
    public String getEmailVerificationToken() { return emailVerificationToken; }
    public void setEmailVerificationToken(String emailVerificationToken) { this.emailVerificationToken = emailVerificationToken; }

    @JsonIgnore
    public LocalDateTime getEmailVerificationExpiry() { return emailVerificationExpiry; }
    public void setEmailVerificationExpiry(LocalDateTime emailVerificationExpiry) { this.emailVerificationExpiry = emailVerificationExpiry; }

    public boolean isEmailVerified() { return emailVerified; }
    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }

    @JsonIgnore
    public String getResetToken() { return resetToken; }
    public void setResetToken(String resetToken) { this.resetToken = resetToken; }

    @JsonIgnore
    public LocalDateTime getResetTokenExpiry() { return resetTokenExpiry; }
    public void setResetTokenExpiry(LocalDateTime resetTokenExpiry) { this.resetTokenExpiry = resetTokenExpiry; }
}