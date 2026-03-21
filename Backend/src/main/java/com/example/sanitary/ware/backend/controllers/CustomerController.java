package com.example.sanitary.ware.backend.controllers;

import com.example.sanitary.ware.backend.dto.ChangePasswordRequest;
import com.example.sanitary.ware.backend.entities.ActivityLog;
import com.example.sanitary.ware.backend.entities.Address;
import com.example.sanitary.ware.backend.entities.Product;
import com.example.sanitary.ware.backend.entities.User;
import com.example.sanitary.ware.backend.services.ActivityLogService;
import com.example.sanitary.ware.backend.services.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;
    private final ActivityLogService activityLogService;

    // Profile
    @GetMapping("/profile")
    public ResponseEntity<com.example.sanitary.ware.backend.dto.CustomerDetailDTO> getProfile(
            @AuthenticationPrincipal User user) {
        if (user == null)
            return ResponseEntity.status(401).build();
        return ResponseEntity.ok(customerService.getCustomerDetails(user.getId()));
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(@AuthenticationPrincipal User user,
            @RequestBody(required = false) User profileData) {
        if (user == null)
            return ResponseEntity.status(401).build();
        if (profileData == null) {
            return ResponseEntity.ok(customerService.getProfileById(user.getId()));
        }
        return ResponseEntity.ok(customerService.updateProfileById(user.getId(), profileData));
    }

    @PutMapping("/change-password")
    public ResponseEntity<Void> changePassword(@AuthenticationPrincipal User user,
            @RequestBody ChangePasswordRequest request) {
        if (user == null)
            return ResponseEntity.status(401).build();
        customerService.changePasswordById(user.getId(), request.getOldPassword(), request.getNewPassword());
        return ResponseEntity.ok().build();
    }

    // Addresses
    @GetMapping("/addresses")
    public ResponseEntity<List<Address>> getAddresses(@AuthenticationPrincipal User user) {
        if (user == null)
            return ResponseEntity.status(401).build();
        return ResponseEntity.ok(customerService.getAddresses(user.getId()));
    }

    @PostMapping("/addresses")
    public ResponseEntity<Address> addAddress(@AuthenticationPrincipal User user, @RequestBody Address address) {
        if (user == null)
            return ResponseEntity.status(401).build();
        return ResponseEntity.ok(customerService.addAddress(user.getId(), address));
    }

    @PutMapping("/addresses/{id:[0-9]+}")
    public ResponseEntity<Address> updateAddress(@AuthenticationPrincipal User user, @PathVariable Long id,
            @RequestBody Address address) {
        if (user == null)
            return ResponseEntity.status(401).build();
        return ResponseEntity.ok(customerService.updateAddress(user.getId(), id, address));
    }

    @DeleteMapping("/addresses/{id:[0-9]+}")
    public ResponseEntity<Void> deleteAddress(@AuthenticationPrincipal User user, @PathVariable Long id) {
        if (user == null)
            return ResponseEntity.status(401).build();
        customerService.deleteAddress(user.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/addresses/{id:[0-9]+}/default")
    public ResponseEntity<Void> setDefaultAddress(@AuthenticationPrincipal User user, @PathVariable Long id) {
        if (user == null)
            return ResponseEntity.status(401).build();
        customerService.setDefaultAddress(user.getId(), id);
        return ResponseEntity.ok().build();
    }

    // Wishlist
    @GetMapping("/wishlist")
    public ResponseEntity<List<Product>> getWishlist(@AuthenticationPrincipal User user) {
        if (user == null)
            return ResponseEntity.status(401).build();
        return ResponseEntity.ok(customerService.getWishlist(user.getId()));
    }

    @PostMapping("/wishlist")
    public ResponseEntity<Void> addToWishlist(
            @AuthenticationPrincipal User user,
            @RequestBody(required = false) java.util.Map<String, Object> payload,
            @RequestParam(required = false) Long productId) {
        if (user == null)
            return ResponseEntity.status(401).build();

        Long finalProductId = productId;
        if (finalProductId == null && payload != null && payload.get("productId") != null) {
            finalProductId = Long.valueOf(payload.get("productId").toString());
        }

        if (finalProductId == null) {
            return ResponseEntity.badRequest().build();
        }

        customerService.addToWishlist(user.getId(), finalProductId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/wishlist/{productId:[0-9]+}")
    public ResponseEntity<Void> removeFromWishlist(@AuthenticationPrincipal User user, @PathVariable Long productId) {
        if (user == null)
            return ResponseEntity.status(401).build();
        customerService.removeFromWishlist(user.getId(), productId);
        return ResponseEntity.noContent().build();
    }

    // Preferences
    @GetMapping("/preferences")
    public ResponseEntity<?> getPreferences(@AuthenticationPrincipal User user) {
        if (user == null)
            return ResponseEntity.status(401).build();
        return ResponseEntity.ok(customerService.getPreferences(user.getId()));
    }

    @PutMapping("/preferences")
    public ResponseEntity<?> updatePreferences(
            @AuthenticationPrincipal User user,
            @RequestBody java.util.Map<String, Object> preferences) {
        if (user == null)
            return ResponseEntity.status(401).build();
        try {
            return ResponseEntity.ok(customerService.updatePreferences(user.getId(), preferences));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", e.getMessage()));
        }
    }

    // Activity Logs
    @GetMapping("/activity-logs")
    public ResponseEntity<List<ActivityLog>> getActivityLogs(@AuthenticationPrincipal User user) {
        if (user == null)
            return ResponseEntity.status(401).build();
        return ResponseEntity.ok(activityLogService.getUserActivityLogs(user.getId()));
    }
}
