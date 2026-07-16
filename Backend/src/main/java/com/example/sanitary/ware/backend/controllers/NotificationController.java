package com.example.sanitary.ware.backend.controllers;

import com.example.sanitary.ware.backend.entities.Order;
import com.example.sanitary.ware.backend.entities.User;
import com.example.sanitary.ware.backend.enums.OrderStatus;
import com.example.sanitary.ware.backend.services.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private OrderService orderService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getNotifications(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        List<Map<String, Object>> list = new ArrayList<>();
        List<Order> orders = orderService.getCustomerOrders(user.getId());

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

        for (Order order : orders) {
            String orderNum = order.getOrderNumber() != null ? order.getOrderNumber() : ("#" + order.getId());
            String timeStr = order.getCreatedAt() != null ? order.getCreatedAt().format(formatter) : "Recently";

            // 1. Order Placed Notification (Always sent for any order)
            Map<String, Object> placed = new HashMap<>();
            placed.put("id", "placed_" + order.getId());
            placed.put("title", "Order Placed Successfully");
            placed.put("message", "Your order " + orderNum + " of amount ₹" + order.getTotalAmount() + " has been successfully placed and is in processing.");
            placed.put("type", "order");
            placed.put("iconName", "MdCheckCircle");
            placed.put("bg", "bg-emerald-500/10");
            placed.put("color", "text-emerald-500");
            placed.put("time", timeStr);
            placed.put("isRead", true);
            list.add(placed);

            // 2. Shipping & OTP Notifications (If status is SHIPPED, DELIVERED)
            if (order.getStatus() == OrderStatus.SHIPPED || order.getStatus() == OrderStatus.DELIVERED) {
                Map<String, Object> shipped = new HashMap<>();
                shipped.put("id", "shipped_" + order.getId());
                shipped.put("title", "Order Shipped");
                shipped.put("message", "Great news! Your order " + orderNum + " has been packed and shipped. Carrier: " + 
                            (order.getCarrier() != null ? order.getCarrier() : "Singhai Logistics") + 
                            (order.getTrackingNumber() != null ? " (Tracking ID: " + order.getTrackingNumber() + ")" : ""));
                shipped.put("type", "order");
                shipped.put("iconName", "MdLocalShipping");
                shipped.put("bg", "bg-sky-500/10");
                shipped.put("color", "text-sky-500");
                shipped.put("time", timeStr);
                shipped.put("isRead", order.getStatus() == OrderStatus.DELIVERED);
                list.add(shipped);

                // OTP Notification (for delivery verification)
                int otp = 1000 + (int)(order.getId() * 1793 % 9000);
                Map<String, Object> otpNotif = new HashMap<>();
                otpNotif.put("id", "otp_" + order.getId());
                otpNotif.put("title", "Delivery Verification OTP");
                otpNotif.put("message", "Use verification code " + otp + " to verify your delivery for order " + orderNum + ". Share this OTP only with the delivery agent upon receiving the package.");
                otpNotif.put("type", "order");
                otpNotif.put("iconName", "MdMessage");
                otpNotif.put("bg", "bg-amber-500/10");
                otpNotif.put("color", "text-amber-500");
                otpNotif.put("time", timeStr);
                otpNotif.put("isRead", order.getStatus() == OrderStatus.DELIVERED);
                list.add(otpNotif);
            }

            // 3. Delivered Notification (If status is DELIVERED)
            if (order.getStatus() == OrderStatus.DELIVERED) {
                Map<String, Object> delivered = new HashMap<>();
                delivered.put("id", "delivered_" + order.getId());
                delivered.put("title", "Order Delivered");
                delivered.put("message", "Your package for order " + orderNum + " has been successfully delivered and verified via OTP. Thank you for shopping with us!");
                delivered.put("type", "order");
                delivered.put("iconName", "MdCheckCircle");
                delivered.put("bg", "bg-teal-500/10");
                delivered.put("color", "text-teal-600");
                delivered.put("time", timeStr);
                delivered.put("isRead", true);
                list.add(delivered);
            }

            // 4. Cancelled Notification (If status is CANCELLED)
            if (order.getStatus() == OrderStatus.CANCELLED) {
                Map<String, Object> cancelled = new HashMap<>();
                cancelled.put("id", "cancelled_" + order.getId());
                cancelled.put("title", "Order Cancelled");
                cancelled.put("message", "Your order " + orderNum + " has been cancelled.");
                cancelled.put("type", "order");
                cancelled.put("iconName", "MdError");
                cancelled.put("bg", "bg-rose-500/10");
                cancelled.put("color", "text-rose-500");
                cancelled.put("time", timeStr);
                cancelled.put("isRead", true);
                list.add(cancelled);
            }
        }

        // Reverse order so latest notifications come first
        List<Map<String, Object>> reversed = new ArrayList<>();
        for (int i = list.size() - 1; i >= 0; i--) {
            reversed.add(list.get(i));
        }

        return ResponseEntity.ok(reversed);
    }

    @GetMapping("/admin")
    public ResponseEntity<List<Map<String, Object>>> getAdminNotifications() {
        return ResponseEntity.ok(new ArrayList<>());
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<Void> markAllRead() {
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable String id) {
        return ResponseEntity.ok().build();
    }
}
