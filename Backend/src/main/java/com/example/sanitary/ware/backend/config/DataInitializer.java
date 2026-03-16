package com.example.sanitary.ware.backend.config;

import com.example.sanitary.ware.backend.entities.User;
import com.example.sanitary.ware.backend.enums.Role;
import com.example.sanitary.ware.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            // Check if any admin exists
            if (!userRepository.existsByRole(Role.ADMIN)) {
                System.out.println("No Admin account found. Creating default administrator...");
                
                User admin = User.builder()
                        .firstName("System")
                        .lastName("Admin")
                        .email("admin@singhai.com")
                        .password(passwordEncoder.encode("Admin@123"))
                        .phone("0000000000")
                        .role(Role.ADMIN)
                        .active(true)
                        .build();
                
                userRepository.save(admin);
                System.out.println("Default Admin created: admin@singhai.com / Admin@123");
            } else {
                System.out.println("Admin account already exists. Skipping initialization.");
            }
        };
    }
}
