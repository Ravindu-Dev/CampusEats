package com.campuseats.service;

import com.campuseats.dto.CreateReviewRequest;
import com.campuseats.dto.ReviewResponse;
import com.campuseats.model.Canteen;
import com.campuseats.model.Order;
import com.campuseats.model.Review;
import com.campuseats.model.User;
import com.campuseats.repository.CanteenRepository;
import com.campuseats.repository.OrderRepository;
import com.campuseats.repository.ReviewRepository;
import com.campuseats.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CanteenRepository canteenRepository;

    @Transactional
    public ReviewResponse createReview(CreateReviewRequest request, String userId) {
        // Verify order exists and belongs to user
        Order order = orderRepository.findByIdAndUserId(request.getOrderId(), userId)
                .orElseThrow(() -> new RuntimeException("Order not found or does not belong to you"));

        // Verify order is completed and payment succeeded
        if (order.getOrderStatus() != Order.OrderStatus.COMPLETED) {
            throw new RuntimeException("Can only review completed orders");
        }

        if (!"succeeded".equalsIgnoreCase(order.getPaymentStatus())) {
            throw new RuntimeException("Can only review orders with successful payment");
        }

        // Verify order hasn't been reviewed already
        if (Boolean.TRUE.equals(order.getHasReview())) {
            throw new RuntimeException("This order has already been reviewed");
        }

        if (reviewRepository.existsByOrderId(request.getOrderId())) {
            throw new RuntimeException("A review already exists for this order");
        }

        // Get user details
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get canteen details
        Canteen canteen = canteenRepository.findById(request.getCanteenId())
                .orElseThrow(() -> new RuntimeException("Canteen not found"));

        // Extract order item names
        List<String> orderItemNames = order.getOrderItems().stream()
                .map(Order.OrderItem::getName)
                .collect(Collectors.toList());

        // Create review
        Review review = new Review();
        review.setUserId(userId);
        review.setUserName(user.getFirstName() + " " + user.getLastName());
        review.setOrderId(request.getOrderId());
        review.setCanteenId(request.getCanteenId());
        review.setCanteenName(canteen.getCanteenName());
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setOrderItems(orderItemNames);

        Review savedReview = reviewRepository.save(review);

        // Update order's hasReview flag
        order.setHasReview(true);
        orderRepository.save(order);

        // Update canteen rating
        updateCanteenRating(request.getCanteenId());

        return convertToResponse(savedReview);
    }

    public List<ReviewResponse> getUserReviews(String userId) {
        List<Review> reviews = reviewRepository.findByUserId(userId);
        return reviews.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<ReviewResponse> getCanteenReviews(String canteenId) {
        List<Review> reviews = reviewRepository.findByCanteenId(canteenId);
        return reviews.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<ReviewResponse> getAllReviews() {
        List<Review> reviews = reviewRepository.findAllByOrderByCreatedAtDesc();
        return reviews.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateCanteenRating(String canteenId) {
        List<Review> reviews = reviewRepository.findByCanteenId(canteenId);

        if (reviews.isEmpty()) {
            // No reviews, set rating to 0
            Canteen canteen = canteenRepository.findById(canteenId)
                    .orElseThrow(() -> new RuntimeException("Canteen not found"));
            canteen.setRating(0.0);
            canteen.setTotalRatings(0);
            canteenRepository.save(canteen);
            return;
        }

        // Calculate average rating
        double averageRating = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        // Update canteen
        Canteen canteen = canteenRepository.findById(canteenId)
                .orElseThrow(() -> new RuntimeException("Canteen not found"));
        canteen.setRating(averageRating);
        canteen.setTotalRatings(reviews.size());
        canteenRepository.save(canteen);
    }

    private ReviewResponse convertToResponse(Review review) {
        return new ReviewResponse(
                review.getId(),
                review.getUserId(),
                review.getUserName(),
                review.getOrderId(),
                review.getCanteenId(),
                review.getCanteenName(),
                review.getRating(),
                review.getComment(),
                review.getOrderItems(),
                review.getCreatedAt(),
                review.getUpdatedAt());
    }
}
