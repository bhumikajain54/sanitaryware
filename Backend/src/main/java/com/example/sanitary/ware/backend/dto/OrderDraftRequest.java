package com.example.sanitary.ware.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class OrderDraftRequest {
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private String customerAddress;
    private String tourLocation;
    private String salesPersonName;
    private String internalNotes;
    private List<DraftItemRequest> items;

    @Data
    public static class DraftItemRequest {
        private Long productId;
        private String name;
        private Integer quantity;
        private Double rate;
        private Double manualPrice;
        private Double discount;
        private Double discountPercentage;
    }
}
