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

    public OrderResponse getOrderById(String orderId, String userId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
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
                order.getCreatedAt(),
                order.getUpdatedAt());
    }
}
