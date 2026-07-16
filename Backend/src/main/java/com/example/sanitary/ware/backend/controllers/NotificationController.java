package com.example.sanitary.ware.backend.controllers;

import com.example.sanitary.ware.backend.entities.Order;
import com.example.sanitary.ware.backend.entities.User;
import com.example.sanitary.ware.backend.entities.Product;
import com.example.sanitary.ware.backend.entities.ContactMessage;
import com.example.sanitary.ware.backend.enums.OrderStatus;
import com.example.sanitary.ware.backend.services.OrderService;
import com.example.sanitary.ware.backend.repositories.ProductRepository;
import com.example.sanitary.ware.backend.repositories.ContactRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.HashSet;
import java.util.Collections;
import java.util.Optional;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ContactRepository contactRepository;

    private static final Set<String> readNotificationIds = Collections.synchronizedSet(new HashSet<>());

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
        List<Map<String, Object>> list = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

        // 1. Order Notifications
        try {
            List<Order> orders = orderService.getAllOrders();
            if (orders != null) {
                for (Order order : orders) {
                    String orderIdStr = "admin_order_" + order.getId();
                    String orderNum = order.getOrderNumber() != null ? order.getOrderNumber() : ("#" + order.getId());
                    String timeStr = order.getCreatedAt() != null ? order.getCreatedAt().format(formatter) : "Recently";

                    Map<String, Object> notif = new HashMap<>();
                    notif.put("id", orderIdStr);
                    notif.put("title", "New Order Received: " + orderNum);
                    notif.put("message", "Customer has placed an order for ₹" + order.getTotalAmount() + ". Status is " + order.getStatus() + ".");
                    notif.put("type", "order");
                    
                    boolean isUnread = (order.getStatus() == OrderStatus.PENDING) && !readNotificationIds.contains(orderIdStr);
                    notif.put("unread", isUnread);
                    notif.put("time", timeStr);
                    list.add(notif);
                }
            }
        } catch (Exception e) {
            System.err.println("Error fetching orders for admin notifications: " + e.getMessage());
        }

        // 2. Low Stock Alerts
        try {
            List<Product> products = productRepository.findAll();
            if (products != null) {
                for (Product product : products) {
                    int stock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
                    if (stock < 10) {
                        String stockIdStr = "admin_stock_" + product.getId();
                        String timeStr = product.getUpdatedAt() != null ? product.getUpdatedAt().format(formatter) : "Now";

                        Map<String, Object> notif = new HashMap<>();
                        notif.put("id", stockIdStr);
                        notif.put("title", "Low Stock Alert: " + product.getName());
                        notif.put("message", "Only " + stock + " items left in stock. Please reorder soon to avoid running out of stock.");
                        notif.put("type", "alert");
                        
                        boolean isUnread = !readNotificationIds.contains(stockIdStr);
                        notif.put("unread", isUnread);
                        notif.put("time", timeStr);
                        list.add(notif);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error fetching products for admin notifications: " + e.getMessage());
        }

        // 3. Customer Inquiry Notifications
        try {
            List<ContactMessage> messages = contactRepository.findAll();
            if (messages != null) {
                for (ContactMessage message : messages) {
                    String queryIdStr = "admin_query_" + message.getId();
                    String timeStr = message.getCreatedAt() != null ? message.getCreatedAt().format(formatter) : "Recently";

                    Map<String, Object> notif = new HashMap<>();
                    notif.put("id", queryIdStr);
                    notif.put("title", "New Customer Inquiry: " + message.getSubject());
                    notif.put("message", "From " + message.getName() + " (" + message.getEmail() + "): " + message.getMessage());
                    notif.put("type", "query");
                    
                    boolean isUnread = !message.isRead() && !readNotificationIds.contains(queryIdStr);
                    notif.put("unread", isUnread);
                    notif.put("time", timeStr);
                    list.add(notif);
                }
            }
        } catch (Exception e) {
            System.err.println("Error fetching inquiries for admin notifications: " + e.getMessage());
        }

        // Reverse list so newest notifications appear first
        List<Map<String, Object>> reversed = new ArrayList<>();
        for (int i = list.size() - 1; i >= 0; i--) {
            reversed.add(list.get(i));
        }

        return ResponseEntity.ok(reversed);
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<Void> markAllRead() {
        try {
            List<ContactMessage> messages = contactRepository.findAll();
            if (messages != null) {
                for (ContactMessage m : messages) {
                    if (!m.isRead()) {
                        m.setRead(true);
                        contactRepository.save(m);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error marking all inquiries as read: " + e.getMessage());
        }

        try {
            List<Order> orders = orderService.getAllOrders();
            if (orders != null) {
                for (Order o : orders) {
                    readNotificationIds.add("admin_order_" + o.getId());
                }
            }
            List<Product> products = productRepository.findAll();
            if (products != null) {
                for (Product p : products) {
                    readNotificationIds.add("admin_stock_" + p.getId());
                }
            }
            List<ContactMessage> messages = contactRepository.findAll();
            if (messages != null) {
                for (ContactMessage m : messages) {
                    readNotificationIds.add("admin_query_" + m.getId());
                }
            }
        } catch (Exception e) {
            System.err.println("Error marking all read in memory: " + e.getMessage());
        }
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable String id) {
        readNotificationIds.add(id);

        if (id.startsWith("admin_query_")) {
            try {
                Long queryId = Long.parseLong(id.substring("admin_query_".length()));
                Optional<ContactMessage> msgOpt = contactRepository.findById(queryId);
                if (msgOpt.isPresent()) {
                    ContactMessage msg = msgOpt.get();
                    msg.setRead(true);
                    contactRepository.save(msg);
                }
            } catch (Exception e) {
                System.err.println("Failed to mark message read in DB: " + e.getMessage());
            }
        }
        return ResponseEntity.ok().build();
    }
}
