package com.campuseats.controller;

import com.campuseats.dto.CreateOrderRequest;
import com.campuseats.dto.OrderResponse;
import com.campuseats.model.User;
import com.campuseats.repository.UserRepository;
import com.campuseats.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
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
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        OrderResponse order = orderService.createOrder(getCurrentUserId(), request);
        return ResponseEntity.ok(order);
    }

    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<OrderResponse>> getUserOrders() {
        List<OrderResponse> orders = orderService.getUserOrders(getCurrentUserId());
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{orderId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable String orderId) {
        OrderResponse order = orderService.getOrderById(orderId, getCurrentUserId());
        return ResponseEntity.ok(order);
    }

    @GetMapping("/canteen/{canteenId}")
    @PreAuthorize("hasRole('CANTEEN_OWNER')")
    public ResponseEntity<List<OrderResponse>> getCanteenOrders(@PathVariable String canteenId) {
        // In a real app, verify that the current user owns this canteen
        List<OrderResponse> orders = orderService.getCanteenOrders(canteenId);
        return ResponseEntity.ok(orders);
    }

    @PatchMapping("/{orderId}/status")
    @PreAuthorize("hasRole('CANTEEN_OWNER')")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable String orderId,
            @Valid @RequestBody com.campuseats.dto.OrderStatusUpdateRequest request,
            @RequestParam String canteenId) {
        try {
            OrderResponse updatedOrder = orderService.updateOrderStatus(orderId, request.getStatus(), canteenId);
            return ResponseEntity.ok(updatedOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{orderId}/status")
    public ResponseEntity<OrderResponse> getOrderStatus(@PathVariable String orderId) {
        try {
            // This endpoint is public so both users and canteen owners can check status
            OrderResponse order = orderService.getOrderById(orderId, null);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
