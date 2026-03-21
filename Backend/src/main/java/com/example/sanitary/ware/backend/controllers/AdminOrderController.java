package com.example.sanitary.ware.backend.controllers;

import com.example.sanitary.ware.backend.entities.Order;
import com.example.sanitary.ware.backend.enums.OrderStatus;
import com.example.sanitary.ware.backend.services.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/{id:[0-9]+}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @PutMapping("/{id:[0-9]+}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String orderStatus,
            @RequestBody(required = false) java.util.Map<String, Object> payload) {

        // Log incoming request for debugging
        System.out.println("=== Update Order Status Request ===");
        System.out.println("Order ID: " + id);
        System.out.println("Status param: " + status);
        System.out.println("OrderStatus param: " + orderStatus);
        System.out.println("Payload: " + payload);

        String statusStr = status != null ? status : orderStatus;
        OrderStatus finalStatus = null;

        // Try to get from request parameters first
        if (statusStr != null) {
            try {
                finalStatus = OrderStatus.valueOf(statusStr.toUpperCase());
                System.out.println("Parsed status from param: " + finalStatus);
            } catch (IllegalArgumentException e) {
                System.out.println("Failed to parse status from param: " + statusStr);
            }
        }

        // Try to get from request body
        if (finalStatus == null && payload != null) {
            Object statusObj = payload.get("status");
            if (statusObj == null) {
                statusObj = payload.get("orderStatus");
            }

            if (statusObj != null) {
                try {
                    finalStatus = OrderStatus.valueOf(statusObj.toString().toUpperCase());
                    System.out.println("Parsed status from body: " + finalStatus);
                } catch (IllegalArgumentException e) {
                    System.out.println("Failed to parse status from body: " + statusObj);
                }
            }
        }

        if (finalStatus == null) {
            System.out.println("ERROR: No valid status found in request");
            System.out.println(
                    "Valid statuses are: PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, RETURNED");
            return ResponseEntity.badRequest().build();
        }

        System.out.println("Updating order " + id + " to status: " + finalStatus);
        Order updatedOrder = orderService.updateOrderStatus(id, finalStatus);
        System.out.println("Order updated successfully");
        return ResponseEntity.ok(updatedOrder);
    }

    @PutMapping("/{id:[0-9]+}/tracking")
    public ResponseEntity<Order> updateTrackingDetails(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> payload) {
        String trackingNumber = payload.get("trackingNumber");
        String carrier = payload.get("carrier");
        String estimatedDelivery = payload.get("estimatedDelivery");
        String trackingUrl = payload.get("trackingUrl");

        return ResponseEntity.ok(orderService.updateTrackingDetails(id, trackingNumber, carrier, estimatedDelivery, trackingUrl));
    }

    @DeleteMapping("/{id:[0-9]+}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id:[0-9]+}/send-whatsapp")
    public ResponseEntity<Void> sendWhatsApp(@PathVariable Long id) {
        Order order = orderService.getOrderById(id);
        orderService.getWhatsAppService().sendOrderConfirmation(order);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id:[0-9]+}/notes")
    public ResponseEntity<List<com.example.sanitary.ware.backend.entities.OrderNote>> getOrderNotes(
            @PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderNotes(id));
    }

    @PostMapping("/{id:[0-9]+}/notes")
    public ResponseEntity<com.example.sanitary.ware.backend.entities.OrderNote> addOrderNote(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> payload) {
        String note = payload.get("note");
        String addedBy = payload.getOrDefault("addedBy", "Admin");
        return ResponseEntity.ok(orderService.addNote(id, note, addedBy));
    }
}
