// package com.authservice.auth.repository;

// import com.authservice.auth.model.User;
// import org.springframework.data.mongodb.repository.MongoRepository;
// import java.util.Optional;
// import java.util.List;   

// public interface UserRepository extends MongoRepository<User, String> {

//     Optional<User> findByUsername(String username);

//     boolean existsByUsername(String username);

//     User findByEmail(String email);

//     User findByResetToken(String resetToken);

//     List<User> findAllByEmail(String email);  
// }
package com.authservice.auth.repository;

import com.authservice.auth.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {

    // Find a single user by username
    Optional<User> findByUsername(String username);

    // Check if username already exists
    boolean existsByUsername(String username);

    // Email lookup — MUST return Optional
    Optional<User> findByEmail(String email);

    // Reset token lookup — MUST return Optional
    Optional<User> findByResetToken(String resetToken);

    Optional<User> findByEmailVerificationToken(String token);
    
}

