package com.campuseats.repository;

import com.campuseats.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {
        List<Order> findByUserId(String userId);

        List<Order> findByUserIdOrderByCreatedAtDesc(String userId);

        Optional<Order> findByIdAndUserId(String id, String userId);

        List<Order> findByOrderItemsCanteenIdOrderByCreatedAtDesc(String canteenId);

        // Weekly spending analysis - find paid orders after a given date
        List<Order> findByUserIdAndPaymentStatusAndCreatedAtAfter(
                        String userId, String paymentStatus, LocalDateTime after);

        // Queue status methods - only count orders with successful payment
        Long countByOrderItemsCanteenIdAndOrderStatusInAndPaymentStatus(
                        String canteenId,
                        List<Order.OrderStatus> statuses,
                        String paymentStatus);

        Long countByOrderItemsCanteenIdAndOrderStatusInAndOrderTypeAndPaymentStatus(
                        String canteenId,
                        List<Order.OrderStatus> statuses,
                        Order.OrderType orderType,
                        String paymentStatus);
}
