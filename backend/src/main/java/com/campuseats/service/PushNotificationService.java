package com.campuseats.service;

import com.campuseats.model.FCMToken;
import com.campuseats.model.Order;
import com.campuseats.repository.FCMTokenRepository;
import com.google.firebase.FirebaseApp;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PushNotificationService {

    private final FCMTokenRepository fcmTokenRepository;

    /**
     * Check if Firebase is properly initialized
     */
    private boolean isFirebaseAvailable() {
        return !FirebaseApp.getApps().isEmpty();
    }

    /**
     * Send notification when order status changes
     */
    public void sendOrderStatusNotification(Order order, String newStatus) {
        if (!isFirebaseAvailable()) {
            log.debug("Firebase not available, skipping push notification");
            return;
        }

        String title;
        String body;
        String canteenName = order.getOrderItems().isEmpty() ? "Restaurant"
                : order.getOrderItems().get(0).getCanteenName();

        switch (newStatus) {
            case "PREPARING":
                title = "Order Being Prepared 👨‍🍳";
                body = "Your order from " + canteenName + " is now being prepared!";
                break;
            case "READY":
                title = "Order Ready for Pickup! 🔔";
                body = "Your order from " + canteenName + " is ready! Head over to pick it up.";
                break;
            case "COMPLETED":
                title = "Order Complete ✅";
                body = "Your order from " + canteenName + " has been completed. Enjoy your meal! 😋";
                break;
            default:
                title = "Order Update";
                body = "Your order status has been updated to " + newStatus;
                break;
        }

        sendNotificationToUser(order.getUserId(), title, body, order.getId(), newStatus);
    }

    /**
     * Send notification when a new order is placed
     */
    public void sendOrderPlacedNotification(Order order) {
        if (!isFirebaseAvailable()) {
            log.debug("Firebase not available, skipping push notification");
            return;
        }

        String canteenName = order.getOrderItems().isEmpty() ? "Restaurant"
                : order.getOrderItems().get(0).getCanteenName();

        String title = "Order Placed Successfully! 🎉";
        String body = "Your order from " + canteenName + " has been placed. We'll notify you when it's being prepared.";

        sendNotificationToUser(order.getUserId(), title, body, order.getId(), "PENDING");
    }

    /**
     * Send notification to all devices of a user
     */
    private void sendNotificationToUser(String userId, String title, String body, String orderId, String status) {
        List<FCMToken> tokens = fcmTokenRepository.findByUserId(userId);

        if (tokens.isEmpty()) {
            log.debug("No FCM tokens found for user {}", userId);
            return;
        }

        for (FCMToken fcmToken : tokens) {
            try {
                Message message = Message.builder()
                        .setToken(fcmToken.getToken())
                        .setNotification(Notification.builder()
                                .setTitle(title)
                                .setBody(body)
                                .build())
                        .putData("orderId", orderId)
                        .putData("status", status)
                        .putData("type", "ORDER_STATUS_UPDATE")
                        .build();

                String response = FirebaseMessaging.getInstance().send(message);
                log.info("Push notification sent successfully to user {}: {}", userId, response);

            } catch (FirebaseMessagingException e) {
                // If the token is invalid or expired, remove it
                if ("UNREGISTERED".equals(e.getMessagingErrorCode().name()) ||
                        "INVALID_ARGUMENT".equals(e.getMessagingErrorCode().name())) {
                    log.warn("Removing invalid FCM token for user {}", userId);
                    fcmTokenRepository.deleteByToken(fcmToken.getToken());
                } else {
                    log.error("Failed to send push notification to user {}: {}", userId, e.getMessage());
                }
            } catch (Exception e) {
                log.error("Unexpected error sending push notification: {}", e.getMessage());
            }
        }
    }
}
