package com.example.sanitary.ware.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class RazorpayVerificationRequest {
    @JsonProperty("razorpay_order_id")
    private String razorpayOrderId;

    @JsonProperty("razorpay_payment_id")
    private String razorpayPaymentId;

    @JsonProperty("razorpay_signature")
    private String razorpaySignature;

    @JsonProperty("orderId")
    private Long orderId;

    @JsonProperty("internal_order_id")
    private Long internalOrderId;

    @JsonProperty("internalOrderId")
    private Long internalOrderIdCamel;

    public Long getEffectiveOrderId() {
        if (orderId != null)
            return orderId;
        if (internalOrderId != null)
            return internalOrderId;
        return internalOrderIdCamel;
    }
}
