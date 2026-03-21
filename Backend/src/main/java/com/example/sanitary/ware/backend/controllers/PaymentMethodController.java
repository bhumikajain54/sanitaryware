package com.example.sanitary.ware.backend.controllers;

import com.example.sanitary.ware.backend.entities.SavedPaymentMethod;
import com.example.sanitary.ware.backend.entities.User;
import com.example.sanitary.ware.backend.services.SavedPaymentMethodService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customer/payment-methods")
@RequiredArgsConstructor
public class PaymentMethodController {

    private final SavedPaymentMethodService service;

    @GetMapping("/cards")
    public ResponseEntity<List<SavedPaymentMethod>> getSavedCards(@AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(service.getSavedCards(user));
    }

    @PostMapping("/cards")
    public ResponseEntity<SavedPaymentMethod> addSavedCard(@AuthenticationPrincipal User user, @RequestBody Map<String, String> data) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(service.addSavedCard(user, data));
    }

    @DeleteMapping("/cards/{id}")
    public ResponseEntity<Void> deleteSavedCard(@AuthenticationPrincipal User user, @PathVariable Long id) {
        if (user == null) return ResponseEntity.status(401).build();
        service.deleteSavedMethod(user, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/upi")
    public ResponseEntity<List<SavedPaymentMethod>> getSavedUpi(@AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(service.getSavedUpis(user));
    }

    @PostMapping("/upi")
    public ResponseEntity<SavedPaymentMethod> addSavedUpi(@AuthenticationPrincipal User user, @RequestBody Map<String, String> payload) {
        if (user == null) return ResponseEntity.status(401).build();
        String upiId = payload.get("upiId");
        return ResponseEntity.ok(service.addSavedUpi(user, upiId));
    }

    @DeleteMapping("/upi/{id}")
    public ResponseEntity<Void> deleteSavedUpi(@AuthenticationPrincipal User user, @PathVariable Long id) {
        if (user == null) return ResponseEntity.status(401).build();
        service.deleteSavedMethod(user, id);
        return ResponseEntity.noContent().build();
    }
}
