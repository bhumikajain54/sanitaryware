package com.example.sanitary.ware.backend.controllers;

import com.example.sanitary.ware.backend.dto.ReviewRequest;
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
            @RequestBody ReviewRequest reviewRequest) {
        if (user == null)
            return ResponseEntity.status(401).build();

        Long productId = reviewRequest.getProductId();
        if (productId == null) {
            return ResponseEntity.badRequest().build();
        }

        Review review = new Review();
        review.setRating(reviewRequest.getRating());
        review.setComment(reviewRequest.getComment());

        return ResponseEntity.ok(reviewService.addReview(user.getId(), productId, review));
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
