package com.campuseats.controller;

import com.campuseats.dto.PaymentConfirmRequest;
import com.campuseats.dto.PaymentIntentRequest;
import com.campuseats.dto.PaymentIntentResponse;
import com.campuseats.service.OrderService;
import com.campuseats.service.PaymentService;
import com.stripe.exception.StripeException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final OrderService orderService;

    // Stripe minimum is ~$0.50 USD ≈ Rs. 165 LKR. Enforce Rs. 200 for a safe
    // buffer.
    private static final double MINIMUM_ORDER_AMOUNT = 200.0;

    @PostMapping("/create-intent")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> createPaymentIntent(@RequestBody PaymentIntentRequest request) {
        if (request.getAmount() < MINIMUM_ORDER_AMOUNT) {
            Map<String, String> error = new HashMap<>();
            error.put("message", String.format(
                    "Minimum order amount is Rs. %.2f. Current total is Rs. %.2f.",
                    MINIMUM_ORDER_AMOUNT, request.getAmount()));
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        try {
            PaymentIntentResponse response = paymentService.createPaymentIntent(
                    request.getAmount(),
                    request.getOrderId());
            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            throw new RuntimeException("Failed to create payment intent: " + e.getMessage());
        }
    }

    @PostMapping("/confirm")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, String>> confirmPayment(@RequestBody PaymentConfirmRequest request) {
        try {
            String status = paymentService.getPaymentStatus(request.getPaymentIntentId());

            // Update payment status for all orders
            for (String orderId : request.getOrderIds()) {
                orderService.updateOrderPaymentStatus(
                        orderId,
                        status,
                        request.getPaymentIntentId());
            }

            Map<String, String> response = new HashMap<>();
            response.put("status", status);
            response.put("message", "Payment confirmed successfully");

            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            throw new RuntimeException("Failed to confirm payment: " + e.getMessage());
        }
    }
}
