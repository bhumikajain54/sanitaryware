package com.example.sanitary.ware.backend.dto;

import java.util.List;
import com.example.sanitary.ware.backend.entities.Product;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardStats {
    @JsonProperty("totalOrders")
    private long totalOrders;

    @JsonProperty("totalRevenue")
    private double totalRevenue;

    @JsonProperty("totalCustomers")
    private long totalCustomers;

    @JsonProperty("lowStockProducts")
    private long lowStockProducts;

    @JsonProperty("totalProducts")
    private long totalProducts;

    private List<Product> topProducts;
    private List<com.example.sanitary.ware.backend.entities.Order> recentOrders;

    // Alternative getters for frontend compatibility
    public long getOrders() {
        return totalOrders;
    }

    public double getTotalSpent() {
        return totalRevenue;
    }

    public double getRevenue() {
        return totalRevenue;
    }

    public long getCustomers() {
        return totalCustomers;
    }
}
