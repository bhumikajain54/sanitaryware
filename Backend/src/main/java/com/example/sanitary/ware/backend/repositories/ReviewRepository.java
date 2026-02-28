package com.example.sanitary.ware.backend.repositories;

import com.example.sanitary.ware.backend.entities.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductIdAndApprovedTrue(Long productId);

    List<Review> findByUserId(Long userId);
}
