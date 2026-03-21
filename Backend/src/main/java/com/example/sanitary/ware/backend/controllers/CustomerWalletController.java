package com.example.sanitary.ware.backend.controllers;

import com.example.sanitary.ware.backend.entities.User;
import com.example.sanitary.ware.backend.entities.Wallet;
import com.example.sanitary.ware.backend.services.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/customer/wallet")
@RequiredArgsConstructor
public class CustomerWalletController {

    private final WalletService walletService;

    @GetMapping("/balance")
    public ResponseEntity<Map<String, Object>> getBalance(@AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        Wallet wallet = walletService.getWalletForUser(user);
        return ResponseEntity.ok(Map.of("balance", wallet.getBalance()));
    }

    @PostMapping("/add")
    public ResponseEntity<Map<String, Object>> addMoney(@AuthenticationPrincipal User user, @RequestBody Map<String, Double> payload) {
        if (user == null) return ResponseEntity.status(401).build();
        Double amount = payload.get("amount");
        Wallet wallet = walletService.addMoney(user, amount);
        return ResponseEntity.ok(Map.of("balance", wallet.getBalance(), "message", "Money added successfully"));
    }

    @GetMapping("/history")
    public ResponseEntity<java.util.List<com.example.sanitary.ware.backend.entities.WalletTransaction>> getHistory(@AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(walletService.getHistory(user));
    }
}
