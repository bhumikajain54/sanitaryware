package com.example.sanitary.ware.backend.controllers;

import com.example.sanitary.ware.backend.dto.AuthResponse;
import com.example.sanitary.ware.backend.dto.ChangePasswordRequest;
import com.example.sanitary.ware.backend.dto.LoginRequest;
import com.example.sanitary.ware.backend.dto.RegisterRequest;
import com.example.sanitary.ware.backend.entities.User;
import com.example.sanitary.ware.backend.services.AuthService;
import com.example.sanitary.ware.backend.services.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final CustomerService customerService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody @NonNull RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody @NonNull LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.ok().build();
    }

    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(
            @org.springframework.security.core.annotation.AuthenticationPrincipal User user) {
        if (user == null)
            return ResponseEntity.status(401).build();
        return ResponseEntity.ok(customerService.getProfileById(user.getId()));
    }

    @PutMapping("/update-profile")
    public ResponseEntity<User> updateProfile(
            @org.springframework.security.core.annotation.AuthenticationPrincipal User user,
            @RequestBody(required = false) User profileData) {
        if (user == null)
            return ResponseEntity.status(401).build();
        if (profileData == null) {
            return ResponseEntity.ok(customerService.getProfileById(user.getId()));
        }
        return ResponseEntity.ok(customerService.updateProfileById(user.getId(), profileData));
    }

    @PutMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            @org.springframework.security.core.annotation.AuthenticationPrincipal User user,
            @RequestBody ChangePasswordRequest request) {
        if (user == null)
            return ResponseEntity.status(401).build();
        customerService.changePasswordById(user.getId(), request.getOldPassword(), request.getNewPassword());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/admin/exists")
    public ResponseEntity<java.util.Map<String, Boolean>> isAdminExists() {
        return ResponseEntity.ok(java.util.Map.of("exists", authService.isAdminExists()));
    }
}
