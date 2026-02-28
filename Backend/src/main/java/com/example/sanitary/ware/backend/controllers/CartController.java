package com.example.sanitary.ware.backend.controllers;

import com.example.sanitary.ware.backend.entities.CartItem;
import com.example.sanitary.ware.backend.entities.User;
import com.example.sanitary.ware.backend.services.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<List<CartItem>> getCart(@AuthenticationPrincipal User user) {
        if (user == null)
            return ResponseEntity.status(401).build();
        return ResponseEntity.ok(cartService.getCart(user.getId()));
    }

    @PostMapping
    public ResponseEntity<Void> addToCart(
            @AuthenticationPrincipal User user,
            @RequestBody(required = false) java.util.Map<String, Object> payload,
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Integer quantity) {
        if (user == null)
            return ResponseEntity.status(401).build();

        Long finalProductId = productId;
        Integer finalQuantity = quantity;

        if (payload != null) {
            if (finalProductId == null && payload.get("productId") != null) {
                finalProductId = Long.valueOf(payload.get("productId").toString());
            }
            if (finalQuantity == null && payload.get("quantity") != null) {
                finalQuantity = Integer.valueOf(payload.get("quantity").toString());
            }
        }

        if (finalProductId == null || finalQuantity == null) {
            return ResponseEntity.badRequest().build();
        }

        cartService.addToCart(user.getId(), finalProductId, finalQuantity);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{itemId}")
    public ResponseEntity<Void> updateQuantity(
            @PathVariable Long itemId,
            @RequestParam(required = false) Integer quantity,
            @RequestBody(required = false) java.util.Map<String, Integer> payload) {
        Integer finalQuantity = quantity;
        if (finalQuantity == null && payload != null) {
            finalQuantity = payload.get("quantity");
        }
        if (finalQuantity == null) {
            return ResponseEntity.badRequest().build();
        }
        cartService.updateQuantity(itemId, finalQuantity);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> removeItem(@PathVariable Long itemId) {
        cartService.removeItem(itemId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal User user) {
        if (user == null)
            return ResponseEntity.status(401).build();
        cartService.clearCart(user.getId());
        return ResponseEntity.noContent().build();
    }
}
