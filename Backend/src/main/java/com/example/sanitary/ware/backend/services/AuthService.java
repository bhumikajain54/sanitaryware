package com.example.sanitary.ware.backend.services;

import com.example.sanitary.ware.backend.dto.AuthResponse;
import com.example.sanitary.ware.backend.dto.LoginRequest;
import com.example.sanitary.ware.backend.dto.RegisterRequest;
import com.example.sanitary.ware.backend.entities.User;
import com.example.sanitary.ware.backend.enums.Role;
import com.example.sanitary.ware.backend.repositories.UserRepository;
import com.example.sanitary.ware.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

        private final UserRepository userRepository;
        private final ActivityLogService activityLogService;
        private final JwtService jwtService;
        private final PasswordEncoder passwordEncoder;
        private final AuthenticationManager authenticationManager;

        public AuthResponse register(@NonNull RegisterRequest request) {
                if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                        throw new RuntimeException("Email already exists");
                }

                User user = User.builder()
                                .firstName(request.getFirstName())
                                .lastName(request.getLastName())
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .phone(request.getPhone())
                                .role(request.getRole() != null ? request.getRole() : Role.CUSTOMER)
                                .active(true)
                                .build();

                @SuppressWarnings("null")
                User savedUser = userRepository.save(user);

                String jwtToken = jwtService.generateToken(savedUser);

                activityLogService.log(savedUser.getId(), savedUser.getEmail(), "USER_REGISTER", "AUTH",
                                "Registered new user");

                return AuthResponse.builder()
                                .id(savedUser.getId())
                                .token(jwtToken)
                                .email(savedUser.getEmail())
                                .role(savedUser.getRole())
                                .firstName(savedUser.getFirstName())
                                .lastName(savedUser.getLastName())
                                .build();
        }

        public AuthResponse login(@NonNull LoginRequest request) {
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail(),
                                                request.getPassword()));

                User user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                String jwtToken = jwtService.generateToken(user);

                activityLogService.log(user.getId(), user.getEmail(), "USER_LOGIN", "AUTH", "Logged in");

                return AuthResponse.builder()
                                .id(user.getId())
                                .token(jwtToken)
                                .email(user.getEmail())
                                .role(user.getRole())
                                .firstName(user.getFirstName())
                                .lastName(user.getLastName())
                                .build();
        }

        public boolean isAdminExists() {
                return userRepository.existsByRole(Role.ADMIN);
        }
}
