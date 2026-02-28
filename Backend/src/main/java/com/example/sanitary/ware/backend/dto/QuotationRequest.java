package com.example.sanitary.ware.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class QuotationRequest {
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private String customerAddress;
    private List<QuotationItemRequest> items;

    @Data
    public static class QuotationItemRequest {
        private Long productId;
        private Integer quantity;
        private Double manualPrice; // Optional: Allow overriding price
        private Double discount; // Flat Discount
        private Double discountPercentage; // Discount %
    }
}
