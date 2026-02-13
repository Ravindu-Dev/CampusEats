package com.campuseats.service;

import com.campuseats.dto.CreateOrderRequest;
import com.campuseats.dto.OrderResponse;
import com.campuseats.model.Cart;
import com.campuseats.model.Order;
import com.campuseats.repository.CartRepository;
import com.campuseats.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

        private final OrderRepository orderRepository;
        private final CartRepository cartRepository;

        public OrderResponse createOrder(String userId, CreateOrderRequest request) {
                // Get user's cart
                Cart cart = cartRepository.findByUserId(userId)
                                .orElseThrow(() -> new RuntimeException("Cart not found"));

                if (cart.getItems() == null || cart.getItems().isEmpty()) {
                        throw new RuntimeException("Cart is empty");
                }

                // Calculate total amount
                double totalAmount = cart.getItems().stream()
                                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                                .sum();

                // Create order items from cart items
                List<Order.OrderItem> orderItems = cart.getItems().stream()
                                .map(cartItem -> new Order.OrderItem(
                                                cartItem.getMenuItemId(),
                                                cartItem.getName(),
                                                cartItem.getPrice(),
                                                cartItem.getQuantity(),
                                                cartItem.getCanteenId(), // Map canteenId
                                                cartItem.getCanteenName(),
                                                cartItem.getImageUrl()))
                                .collect(Collectors.toList());

                // Create order
                Order order = new Order();
                order.setUserId(userId);
                order.setOrderItems(orderItems);
                order.setCustomerName(request.getCustomerName());
                order.setCustomerEmail(request.getCustomerEmail());
                order.setCustomerPhone(request.getCustomerPhone());
                order.setPickupDate(request.getPickupDate());
                order.setPickupTime(request.getPickupTime());
                order.setTotalAmount(totalAmount);
                order.setPaymentStatus("pending");

                Order savedOrder = orderRepository.save(order);

                return convertToResponse(savedOrder);
        }

        public List<OrderResponse> getUserOrders(String userId) {
                List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
                return orders.stream()
                                .map(this::convertToResponse)
                                .collect(Collectors.toList());
        }

        public List<OrderResponse> getCanteenOrders(String canteenId) {
                List<Order> orders = orderRepository.findByOrderItemsCanteenIdOrderByCreatedAtDesc(canteenId);
                return orders.stream()
                                .map(this::convertToResponse)
                                .collect(Collectors.toList());
        }

        public OrderResponse getOrderById(String orderId, String userId) {
                Order order;
                if (userId != null) {
                        order = orderRepository.findByIdAndUserId(orderId, userId)
                                        .orElseThrow(() -> new RuntimeException("Order not found"));
                } else {
                        // For public status checking (no userId verification)
                        order = orderRepository.findById(orderId)
                                        .orElseThrow(() -> new RuntimeException("Order not found"));
                }
                return convertToResponse(order);
        }

        public void updateOrderPaymentStatus(String orderId, String status, String paymentIntentId) {
                Order order = orderRepository.findById(orderId)
                                .orElseThrow(() -> new RuntimeException("Order not found"));
                order.setPaymentStatus(status);
                order.setStripePaymentIntentId(paymentIntentId);
                orderRepository.save(order);
        }

        private OrderResponse convertToResponse(Order order) {
                List<OrderResponse.OrderItemDTO> itemDTOs = order.getOrderItems().stream()
                                .map(item -> new OrderResponse.OrderItemDTO(
                                                item.getMenuItemId(),
                                                item.getName(),
                                                item.getPrice(),
                                                item.getQuantity(),
                                                item.getCanteenId(),
                                                item.getCanteenName(),
                                                item.getImageUrl()))
                                .collect(Collectors.toList());

                return new OrderResponse(
                                order.getId(),
                                order.getUserId(),
                                itemDTOs,
                                order.getCustomerName(),
                                order.getCustomerEmail(),
                                order.getCustomerPhone(),
                                order.getPickupDate(),
                                order.getPickupTime(),
                                order.getTotalAmount(),
                                order.getPaymentStatus(),
                                order.getStripePaymentIntentId(),
                                order.getOrderStatus() != null ? order.getOrderStatus().name() : "PENDING",
                                order.getPreparedAt(),
                                order.getReadyAt(),
                                order.getCompletedAt(),
                                order.getCreatedAt(),
                                order.getUpdatedAt());
        }

        public OrderResponse updateOrderStatus(String orderId, String newStatus, String canteenId) {
                Order order = orderRepository.findById(orderId)
                                .orElseThrow(() -> new RuntimeException("Order not found"));

                // Verify that the order belongs to this canteen
                boolean belongsToCanteen = order.getOrderItems().stream()
                                .anyMatch(item -> item.getCanteenId().equals(canteenId));

                if (!belongsToCanteen) {
                        throw new RuntimeException("Unauthorized: Order does not belong to this canteen");
                }

                Order.OrderStatus currentStatus = order.getOrderStatus();
                Order.OrderStatus targetStatus = Order.OrderStatus.valueOf(newStatus);

                // Validate status transition (can only move forward)
                if (!isValidStatusTransition(currentStatus, targetStatus)) {
                        throw new RuntimeException(
                                        "Invalid status transition from " + currentStatus + " to " + targetStatus);
                }

                // Record status change in history
                Order.StatusChange statusChange = new Order.StatusChange(
                                currentStatus,
                                targetStatus,
                                java.time.LocalDateTime.now(),
                                canteenId);
                order.getStatusHistory().add(statusChange);

                // Update status and timestamps
                order.setOrderStatus(targetStatus);
                switch (targetStatus) {
                        case PREPARING:
                                order.setPreparedAt(java.time.LocalDateTime.now());
                                break;
                        case READY:
                                order.setReadyAt(java.time.LocalDateTime.now());
                                break;
                        case COMPLETED:
                                order.setCompletedAt(java.time.LocalDateTime.now());
                                break;
                        default:
                                break;
                }

                Order updatedOrder = orderRepository.save(order);
                return convertToResponse(updatedOrder);
        }

        private boolean isValidStatusTransition(Order.OrderStatus current, Order.OrderStatus target) {
                // Define valid transitions (can only move forward)
                if (current == target) {
                        return false; // No point in updating to same status
                }

                switch (current) {
                        case PENDING:
                                return target == Order.OrderStatus.PREPARING;
                        case PREPARING:
                                return target == Order.OrderStatus.READY;
                        case READY:
                                return target == Order.OrderStatus.COMPLETED;
                        case COMPLETED:
                                return false; // Cannot transition from completed
                        default:
                                return false;
                }
        }
}
