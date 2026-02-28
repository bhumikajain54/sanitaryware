package com.example.sanitary.ware.backend.controllers;

import com.example.sanitary.ware.backend.services.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/payments")
@RequiredArgsConstructor
public class AdminPaymentController {

    private final PaymentService paymentService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getPaymentHistory());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    @GetMapping("/report")
    public ResponseEntity<Map<String, Object>> getPaymentReport() {
        return ResponseEntity.ok(paymentService.getPaymentReport());
    }
}
