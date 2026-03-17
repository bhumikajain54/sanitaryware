package com.example.sanitary.ware.backend.services;

import com.example.sanitary.ware.backend.entities.Product;
import com.example.sanitary.ware.backend.entities.Review;
import com.example.sanitary.ware.backend.entities.User;
import com.example.sanitary.ware.backend.repositories.ProductRepository;
import com.example.sanitary.ware.backend.repositories.ReviewRepository;
import com.example.sanitary.ware.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public Review addReview(Long userId, Long productId, Review review) {
        User user = userRepository.findById(userId).orElseThrow();
        Product product = productRepository.findById(productId).orElseThrow();
        review.setUser(user);
        review.setProduct(product);
        return reviewRepository.save(review);
    }

    public List<Review> getProductReviews(Long productId) {
        return reviewRepository.findByProductIdAndApprovedTrue(productId);
    }

    public List<Review> getUserReviews(Long userId) {
        return reviewRepository.findByUserId(userId);
    }

    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    public Review updateReview(Long id, Review updatedReview) {
        Review review = reviewRepository.findById(id).orElseThrow();
        review.setRating(updatedReview.getRating());
        review.setComment(updatedReview.getComment());
        return reviewRepository.save(review);
    }

    public void deleteReview(Long id) {
        reviewRepository.deleteById(id);
    }

    public Review approveReview(Long id) {
        Review review = reviewRepository.findById(id).orElseThrow();
        review.setApproved(true);
        return reviewRepository.save(review);
    }
}
