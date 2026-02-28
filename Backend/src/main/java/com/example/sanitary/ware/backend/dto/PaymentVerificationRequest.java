package com.example.sanitary.ware.backend.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class PaymentVerificationRequest extends RazorpayVerificationRequest {
    // Inherits razorpayOrderId, razorpayPaymentId, razorpaySignature,
    // internalOrderId
}
