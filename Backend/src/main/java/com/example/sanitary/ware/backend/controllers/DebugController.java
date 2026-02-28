package com.example.sanitary.ware.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/debug")
public class DebugController {

    @Autowired(required = false)
    private com.example.sanitary.ware.backend.config.RazorpayConfig razorpayConfig;

    @Autowired
    private com.example.sanitary.ware.backend.repositories.PaymentRepository paymentRepository;

    @GetMapping("/check")
    public ResponseEntity<Map<String, Object>> debugCheck(@RequestHeader Map<String, String> headers) {
        Map<String, Object> debugInfo = new HashMap<>();
        debugInfo.put("status", "System is UP");
        debugInfo.put("headersReceived", headers);

        if (razorpayConfig != null) {
            Map<String, Object> rzp = new HashMap<>();
            rzp.put("keyId", razorpayConfig.getKeyId());
            rzp.put("hasSecret", razorpayConfig.getKeySecret() != null && !razorpayConfig.getKeySecret().isEmpty());
            debugInfo.put("razorpayConfig", rzp);
        } else {
            debugInfo.put("razorpayConfig", "NOT_FOUND");
        }

        if (paymentRepository != null) {
            debugInfo.put("recentPayments", paymentRepository.findAll().stream()
                    .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                    .limit(5)
                    .toList());
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            debugInfo.put("authenticated", auth.isAuthenticated());
            debugInfo.put("userEmail", auth.getName());
            debugInfo.put("authorities", auth.getAuthorities());
        } else {
            debugInfo.put("authenticated", false);
        }

        return ResponseEntity.ok(debugInfo);
    }
}
