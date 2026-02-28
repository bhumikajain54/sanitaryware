package com.example.sanitary.ware.backend.controllers;

import com.example.sanitary.ware.backend.entities.Review;
import com.example.sanitary.ware.backend.entities.User;
import com.example.sanitary.ware.backend.services.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<Review> addReview(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) Long productId,
            @RequestBody Review review) {
        if (user == null)
            return ResponseEntity.status(401).build();

        Long finalProductId = productId;
        if (finalProductId == null && review.getProduct() != null) {
            finalProductId = review.getProduct().getId();
        }

        if (finalProductId == null) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(reviewService.addReview(user.getId(), finalProductId, review));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Review>> getProductReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getProductReviews(productId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Review> updateReview(@PathVariable Long id, @RequestBody Review review) {
        return ResponseEntity.ok(reviewService.updateReview(id, review));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/admin/{id}/approve")
    public ResponseEntity<Review> approveReview(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.approveReview(id));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Review>> getMyReviews(@AuthenticationPrincipal User user) {
        if (user == null)
            return ResponseEntity.status(401).build();
        return ResponseEntity.ok(reviewService.getUserReviews(user.getId()));
    }
}
