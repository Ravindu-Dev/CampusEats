package com.campuseats.controller;

import com.campuseats.dto.PaymentConfirmRequest;
import com.campuseats.dto.PaymentIntentRequest;
import com.campuseats.dto.PaymentIntentResponse;
import com.campuseats.service.OrderService;
import com.campuseats.service.PaymentService;
import com.stripe.exception.StripeException;
import lombok.RequiredArgsConstructor;
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

    @PostMapping("/create-intent")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<PaymentIntentResponse> createPaymentIntent(@RequestBody PaymentIntentRequest request) {
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

            // Update order payment status
            orderService.updateOrderPaymentStatus(
                    request.getOrderId(),
                    status,
                    request.getPaymentIntentId());

            Map<String, String> response = new HashMap<>();
            response.put("status", status);
            response.put("message", "Payment confirmed successfully");

            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            throw new RuntimeException("Failed to confirm payment: " + e.getMessage());
        }
    }
}
