package com.campuseats.repository;

import com.campuseats.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends MongoRepository<Review, String> {

    List<Review> findByUserId(String userId);

    List<Review> findByCanteenId(String canteenId);

    Optional<Review> findByOrderId(String orderId);

    List<Review> findAllByOrderByCreatedAtDesc();

    boolean existsByOrderId(String orderId);
}
