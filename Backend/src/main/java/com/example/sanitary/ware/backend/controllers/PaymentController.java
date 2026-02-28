package com.example.sanitary.ware.backend.controllers;

import com.example.sanitary.ware.backend.dto.PaymentRequest;
import com.example.sanitary.ware.backend.dto.RazorpayVerificationRequest;
import com.example.sanitary.ware.backend.services.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/initiate")
    public ResponseEntity<Map<String, Object>> initiatePayment(@RequestBody PaymentRequest request) {
        return ResponseEntity.ok(paymentService.initiatePayment(request));
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyPayment(
            @RequestParam(required = false) String transactionId,
            @RequestBody(required = false) Map<String, String> body) {

        String txnId = transactionId;
        if (txnId == null && body != null) {
            txnId = body.get("transactionId");
        }

        if (txnId == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("status", "FAILED", "message", "Missing required parameter: transactionId"));
        }

        return ResponseEntity.ok(paymentService.verifyPayment(txnId));
    }

    @PostMapping("/verify-razorpay")
    public ResponseEntity<Map<String, Object>> verifyRazorpayPayment(
            @RequestBody RazorpayVerificationRequest request) {
        return ResponseEntity.ok(paymentService.verifyRazorpayPayment(request));
    }

    @PostMapping("/update-status")
    public ResponseEntity<Map<String, Object>> updatePaymentStatus(
            @RequestParam Long orderId,
            @RequestParam String transactionId,
            @RequestParam String status,
            @RequestParam(required = false) String errorCode,
            @RequestParam(required = false) String errorDesc) {
        return ResponseEntity
                .ok(paymentService.updateOrderPaymentStatus(orderId, transactionId, status, errorCode, errorDesc));
    }

    @GetMapping("/history")
    public ResponseEntity<List<Map<String, Object>>> getPaymentHistory() {
        return ResponseEntity.ok(paymentService.getPaymentHistory());
    }
}
