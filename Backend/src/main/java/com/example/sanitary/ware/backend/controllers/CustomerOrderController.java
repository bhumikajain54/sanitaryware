package com.example.sanitary.ware.backend.controllers;

import com.example.sanitary.ware.backend.dto.OrderRequest;
import com.example.sanitary.ware.backend.entities.Order;
import com.example.sanitary.ware.backend.entities.OrderStatusHistory;
import com.example.sanitary.ware.backend.entities.User;
import com.example.sanitary.ware.backend.services.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class CustomerOrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<Order> createOrder(@AuthenticationPrincipal User user, @RequestBody OrderRequest request) {
        if (user == null)
            return ResponseEntity.status(401).build();
        return ResponseEntity.ok(orderService.createOrder(user.getId(), request));
    }

    @GetMapping("/{id:[0-9]+}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @GetMapping("/my-orders")
    public ResponseEntity<List<Order>> getMyOrders(@AuthenticationPrincipal User user) {
        if (user == null)
            return ResponseEntity.status(401).build();
        return ResponseEntity.ok(orderService.getCustomerOrders(user.getId()));
    }

    @GetMapping
    public ResponseEntity<List<Order>> getCustomerOrders(@AuthenticationPrincipal User user) {
        if (user == null)
            return ResponseEntity.status(401).build();
        return ResponseEntity.ok(orderService.getCustomerOrders(user.getId()));
    }

    @PutMapping("/{id:[0-9]+}/cancel")
    public ResponseEntity<Void> cancelOrder(@AuthenticationPrincipal User user, @PathVariable Long id) {
        if (user == null)
            return ResponseEntity.status(401).build();
        orderService.cancelOrder(user.getId(), id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id:[0-9]+}/timeline")
    public ResponseEntity<List<OrderStatusHistory>> getOrderTimeline(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderTimeline(id));
    }
}
