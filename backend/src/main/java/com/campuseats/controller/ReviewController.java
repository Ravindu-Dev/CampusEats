package com.campuseats.controller;

import com.campuseats.dto.CreateReviewRequest;
import com.campuseats.dto.ReviewResponse;
import com.campuseats.model.User;
import com.campuseats.repository.UserRepository;
import com.campuseats.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final UserRepository userRepository;

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> createReview(@Valid @RequestBody CreateReviewRequest request) {
        try {
            ReviewResponse review = reviewService.createReview(request, getCurrentUserId());
            return ResponseEntity.status(HttpStatus.CREATED).body(review);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/my-reviews")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<ReviewResponse>> getMyReviews() {
        List<ReviewResponse> reviews = reviewService.getUserReviews(getCurrentUserId());
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<ReviewResponse>> getUserReviews(@PathVariable String userId) {
        List<ReviewResponse> reviews = reviewService.getUserReviews(userId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/canteen/{canteenId}")
    public ResponseEntity<List<ReviewResponse>> getCanteenReviews(@PathVariable String canteenId) {
        List<ReviewResponse> reviews = reviewService.getCanteenReviews(canteenId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping
    public ResponseEntity<List<ReviewResponse>> getAllReviews() {
        List<ReviewResponse> reviews = reviewService.getAllReviews();
        return ResponseEntity.ok(reviews);
    }
}
