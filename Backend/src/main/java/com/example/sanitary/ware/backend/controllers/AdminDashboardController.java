package com.example.sanitary.ware.backend.controllers;

import com.example.sanitary.ware.backend.entities.Order;
import com.example.sanitary.ware.backend.dto.DashboardStats;
import com.example.sanitary.ware.backend.dto.TrendData;
import com.example.sanitary.ware.backend.services.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;

import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class AdminDashboardController {

    private final DashboardService dashboardService;

    @GetMapping({ "/api/admin/dashboard", "/api/admin/dashboard/" })
    public ResponseEntity<DashboardStats> getDashboard(@RequestParam(defaultValue = "0") int days) {
        return ResponseEntity.ok(dashboardService.getStats(days));
    }

    @GetMapping("/api/admin/dashboard/stats")
    public ResponseEntity<DashboardStats> getStats(@RequestParam(defaultValue = "0") int days) {
        return ResponseEntity.ok(dashboardService.getStats(days));
    }

    @GetMapping("/api/admin/dashboard/summary")
    public ResponseEntity<DashboardStats> getSummary(@RequestParam(defaultValue = "0") int days) {
        return ResponseEntity.ok(dashboardService.getStats(days));
    }

    @GetMapping("/api/admin/dashboard/sales")
    public ResponseEntity<Double> getSales(@RequestParam(defaultValue = "0") int days) {
        return ResponseEntity.ok(dashboardService.getStats(days).getTotalRevenue());
    }

    @GetMapping("/api/admin/dashboard/orders")
    public ResponseEntity<Long> getOrders(@RequestParam(defaultValue = "0") int days) {
        return ResponseEntity.ok((long) dashboardService.getStats(days).getTotalOrders());
    }

    @GetMapping("/api/admin/dashboard/users")
    public ResponseEntity<Long> getUsers(@RequestParam(defaultValue = "0") int days) {
        return ResponseEntity.ok(dashboardService.getStats(days).getTotalCustomers());
    }

    @GetMapping("/api/admin/dashboard/revenue-trend")
    public ResponseEntity<List<TrendData>> getRevenueTrend(@RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(dashboardService.getRevenueTrend(days));
    }

    @GetMapping("/api/admin/dashboard/orders-trend")
    public ResponseEntity<List<TrendData>> getOrdersTrend(@RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(dashboardService.getOrdersTrend(days));
    }

    @GetMapping("/api/admin/dashboard/recent-orders")
    public ResponseEntity<List<Order>> getRecentOrders() {
        return ResponseEntity.ok(dashboardService.getRecentOrders());
    }
}
