package com.authservice.auth.repository;

import com.authservice.auth.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;
import java.util.List;   

public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    User findByEmail(String email);

    User findByResetToken(String resetToken);

    List<User> findAllByEmail(String email);  
}
