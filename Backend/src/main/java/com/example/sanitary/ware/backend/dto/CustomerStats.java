package com.example.sanitary.ware.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CustomerStats {
    @JsonProperty("orders")
    private long orders;

    @JsonProperty("totalSpent")
    private double totalSpent;

    @JsonProperty("totalOrders")
    private long totalOrders;

    @JsonProperty("totalRevenue")
    private double totalRevenue;

    // Alternative getters for compatibility
    public long getTotalOrders() {
        return orders;
    }

    public double getTotalRevenue() {
        return totalSpent;
    }
}
