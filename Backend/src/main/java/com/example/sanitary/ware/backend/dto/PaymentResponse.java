package com.example.sanitary.ware.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private String razorpayOrderId;
    private String orderId; // Internal Order ID
    private Double amount;
    private String currency;
    private String keyId;
    private String companyName;
    private String description;
}
