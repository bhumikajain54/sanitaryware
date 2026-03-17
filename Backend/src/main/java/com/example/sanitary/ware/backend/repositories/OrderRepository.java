package com.example.sanitary.ware.backend.repositories;

import com.example.sanitary.ware.backend.entities.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);

    Optional<Order> findByOrderNumber(String orderNumber);

    long countByUserId(Long userId);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.user.id = :userId")
    Double sumTotalAmountByUserId(Long userId);

    java.util.List<Order> findByCreatedAtAfter(java.time.LocalDateTime date);

    java.util.List<Order> findAllByOrderByCreatedAtDesc();

    java.util.List<Order> findTop500ByOrderByCreatedAtDesc();
}
