package com.example.sanitary.ware.backend.dto;

import lombok.Data;

@Data
public class PaymentRequest {
    private String orderId; // Changed to String to handle "ORD-XXXX"
    private Double amount;
    private String paymentMethod; // UPI, CARD, NET_BANKING
    private String paymentProvider; // RAZORPAY, STRIPE
}
