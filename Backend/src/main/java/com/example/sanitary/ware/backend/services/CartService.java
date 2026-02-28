package com.example.sanitary.ware.backend.services;

import com.example.sanitary.ware.backend.entities.CartItem;
import com.example.sanitary.ware.backend.entities.Product;
import com.example.sanitary.ware.backend.entities.User;
import com.example.sanitary.ware.backend.repositories.CartRepository;
import com.example.sanitary.ware.backend.repositories.ProductRepository;
import com.example.sanitary.ware.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.lang.NonNull;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public List<CartItem> getCart(@NonNull Long userId) {
        return cartRepository.findByUserId(userId);
    }

    public void addToCart(@NonNull Long userId, @NonNull Long productId, Integer quantity) {
        Optional<CartItem> existingItem = cartRepository.findByUserIdAndProductId(userId, productId);
        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
            cartRepository.save(item);
        } else {
            @SuppressWarnings("null")
            User user = userRepository.findById(userId).orElseThrow();
            @SuppressWarnings("null")
            Product product = productRepository.findById(productId).orElseThrow();
            CartItem item = CartItem.builder()
                    .user(user)
                    .product(product)
                    .quantity(quantity)
                    .build();
            cartRepository.save(item);
        }
    }

    public void updateQuantity(@NonNull Long itemId, Integer quantity) {
        @SuppressWarnings("null")
        CartItem item = cartRepository.findById(itemId).orElseThrow();
        item.setQuantity(quantity);
        cartRepository.save(item);
    }

    public void removeItem(@NonNull Long itemId) {
        cartRepository.deleteById(itemId);
    }

    @Transactional
    public void clearCart(@NonNull Long userId) {
        cartRepository.deleteByUserId(userId);
    }
}
