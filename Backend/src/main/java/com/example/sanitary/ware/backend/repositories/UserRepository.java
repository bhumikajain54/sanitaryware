package com.example.sanitary.ware.backend.repositories;

import com.example.sanitary.ware.backend.enums.Role;
import com.example.sanitary.ware.backend.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    List<User> findByRole(Role role);

    boolean existsByRole(Role role);

    Optional<User> findByPhone(String phone);

    long countByCreatedAtAfter(java.time.LocalDateTime date);

    java.util.List<User> findByCreatedAtAfter(java.time.LocalDateTime date);

    java.util.List<User> findAllByOrderByCreatedAtDesc();
}
