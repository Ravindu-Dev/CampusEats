package com.campuseats.service;

import com.campuseats.dto.CreateOrderRequest;
import com.campuseats.dto.OrderResponse;
import com.campuseats.model.Cart;
import com.campuseats.model.CartItem;
import com.campuseats.model.Order;
import com.campuseats.repository.CartRepository;
import com.campuseats.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

        private final OrderRepository orderRepository;
        private final CartRepository cartRepository;
        private final QRCodeService qrCodeService;
        private final PushNotificationService pushNotificationService;
        private final LoyaltyService loyaltyService;

        public List<OrderResponse> createOrder(String userId, CreateOrderRequest request) {
                // Get user's cart
                Cart cart = cartRepository.findByUserId(userId)
                                .orElseThrow(() -> new RuntimeException("Cart not found"));

                if (cart.getItems() == null || cart.getItems().isEmpty()) {
                        throw new RuntimeException("Cart is empty");
                }

                // Validate order type
                if (request.getOrderType() == null ||
                                (!request.getOrderType().equals("NOW") && !request.getOrderType().equals("LATER"))) {
                        throw new RuntimeException("Invalid order type. Must be 'NOW' or 'LATER'");
                }

                // Validate pickup date/time for LATER orders
                if (request.getOrderType().equals("LATER")) {
                        if (request.getPickupDate() == null || request.getPickupDate().trim().isEmpty()) {
                                throw new RuntimeException("Pickup date is required for scheduled orders");
                        }
                        if (request.getPickupTime() == null || request.getPickupTime().trim().isEmpty()) {
                                throw new RuntimeException("Pickup time is required for scheduled orders");
                        }
                }

                // Calculate total for all orders (for proportional discount split)
                double sessionTotal = cart.getItems().stream()
                                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                                .sum();

                // Handle loyalty points redemption
                int pointsToRedeem = 0;
                double totalDiscount = 0.0;
                if (request.getPointsToRedeem() != null && request.getPointsToRedeem() > 0) {
                        pointsToRedeem = request.getPointsToRedeem();
                        totalDiscount = (double) pointsToRedeem; // Rs. 1 per point

                        // Verify and deduct loyalty points
                        try {
                                loyaltyService.redeemPoints(userId, pointsToRedeem);
                        } catch (Exception e) {
                                throw new RuntimeException("Failed to redeem points: " + e.getMessage());
                        }
                }

                // Group cart items by canteen
                Map<String, List<CartItem>> itemsByCanteen = groupItemsByCanteen(cart.getItems());

                // Create separate orders for each canteen
                List<OrderResponse> createdOrders = new ArrayList<>();

                for (Map.Entry<String, List<CartItem>> entry : itemsByCanteen.entrySet()) {
                        String canteenId = entry.getKey();
                        List<CartItem> canteenItems = entry.getValue();

                        // Calculate subtotal for this canteen
                        double canteenSubtotal = canteenItems.stream()
                                        .mapToDouble(item -> item.getPrice() * item.getQuantity())
                                        .sum();

                        // Calculate proportional discount for this order
                        double canteenDiscount = 0.0;
                        int canteenPointsRedeemed = 0;
                        if (totalDiscount > 0 && sessionTotal > 0) {
                                canteenDiscount = (canteenSubtotal / sessionTotal) * totalDiscount;
                                canteenPointsRedeemed = (int) Math
                                                .round((canteenSubtotal / sessionTotal) * pointsToRedeem);
                        }

                        // Create order items for this canteen
                        List<Order.OrderItem> orderItems = canteenItems.stream()
                                        .map(cartItem -> new Order.OrderItem(
                                                        cartItem.getMenuItemId(),
                                                        cartItem.getName(),
                                                        cartItem.getPrice(),
                                                        cartItem.getQuantity(),
                                                        cartItem.getCanteenId(),
                                                        cartItem.getCanteenName(),
                                                        cartItem.getImageUrl()))
                                        .collect(Collectors.toList());

                        // Create order for this canteen
                        Order order = new Order();
                        order.setUserId(userId);
                        order.setOrderItems(orderItems);
                        order.setCustomerName(request.getCustomerName());
                        order.setCustomerEmail(request.getCustomerEmail());
                        order.setCustomerPhone(request.getCustomerPhone());

                        // Set order type
                        order.setOrderType(Order.OrderType.valueOf(request.getOrderType()));

                        // Set pickup date/time based on order type
                        if (request.getOrderType().equals("NOW")) {
                                // For NOW orders, set current date and time
                                java.time.LocalDate currentDate = java.time.LocalDate.now();
                                java.time.LocalTime currentTime = java.time.LocalTime.now();
                                order.setPickupDate(currentDate.toString());
                                order.setPickupTime(currentTime
                                                .format(java.time.format.DateTimeFormatter.ofPattern("HH:mm")));
                        } else {
                                // For LATER orders, use provided date/time
                                order.setPickupDate(request.getPickupDate());
                                order.setPickupTime(request.getPickupTime());
                        }

                        order.setTotalAmount(canteenSubtotal - canteenDiscount);
                        order.setDiscountAmount(canteenDiscount);
                        order.setLoyaltyPointsRedeemed(canteenPointsRedeemed);
                        order.setPaymentStatus("pending");

                        Order savedOrder = orderRepository.save(order);
                        createdOrders.add(convertToResponse(savedOrder));
                }

                return createdOrders;
        }

        // Helper method to group cart items by canteen
        private Map<String, List<CartItem>> groupItemsByCanteen(List<CartItem> cartItems) {
                Map<String, List<CartItem>> grouped = new HashMap<>();
                for (CartItem item : cartItems) {
                        grouped.computeIfAbsent(item.getCanteenId(), k -> new ArrayList<>()).add(item);
                }
                return grouped;
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
                                .map(order -> convertToResponseForCanteen(order, canteenId))
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

                // Generate QR code for successful payments
                if ("succeeded".equals(status)) {
                        String qrCode = qrCodeService.generateQRCode(orderId);
                        order.setQrCodeBase64(qrCode);

                        // Award loyalty points (1 point per Rs. 10 spent)
                        try {
                                loyaltyService.earnPoints(order.getUserId(), orderId, order.getTotalAmount());
                        } catch (Exception e) {
                                // Don't let loyalty failure affect payment processing
                                org.slf4j.LoggerFactory.getLogger(OrderService.class)
                                                .error("Failed to award loyalty points: {}", e.getMessage());
                        }
                }

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
                                order.getQrCodeBase64(),
                                order.getOrderStatus() != null ? order.getOrderStatus().name() : "PENDING",
                                order.getOrderType() != null ? order.getOrderType().name() : "LATER",
                                order.getHasReview(),
                                order.getPreparedAt(),
                                order.getReadyAt(),
                                order.getCompletedAt(),
                                order.getCreatedAt(),
                                order.getUpdatedAt());
        }

        // Convert order to response, filtering items for a specific canteen
        private OrderResponse convertToResponseForCanteen(Order order, String canteenId) {
                // Filter order items to only include items from this canteen
                List<OrderResponse.OrderItemDTO> itemDTOs = order.getOrderItems().stream()
                                .filter(item -> item.getCanteenId().equals(canteenId))
                                .map(item -> new OrderResponse.OrderItemDTO(
                                                item.getMenuItemId(),
                                                item.getName(),
                                                item.getPrice(),
                                                item.getQuantity(),
                                                item.getCanteenId(),
                                                item.getCanteenName(),
                                                item.getImageUrl()))
                                .collect(Collectors.toList());

                // Calculate total amount for this canteen's items only
                double canteenTotal = itemDTOs.stream()
                                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                                .sum();

                return new OrderResponse(
                                order.getId(),
                                order.getUserId(),
                                itemDTOs,
                                order.getCustomerName(),
                                order.getCustomerEmail(),
                                order.getCustomerPhone(),
                                order.getPickupDate(),
                                order.getPickupTime(),
                                canteenTotal, // Use canteen-specific total instead of order total
                                order.getPaymentStatus(),
                                order.getStripePaymentIntentId(),
                                order.getQrCodeBase64(),
                                order.getOrderStatus() != null ? order.getOrderStatus().name() : "PENDING",
                                order.getOrderType() != null ? order.getOrderType().name() : "LATER",
                                order.getHasReview(),
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

                // Verify that payment has been completed
                if (!"succeeded".equals(order.getPaymentStatus())) {
                        throw new RuntimeException(
                                        "Cannot update order status: Payment not completed. Current payment status: "
                                                        + order.getPaymentStatus());
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

                // Send push notification about status change
                try {
                        pushNotificationService.sendOrderStatusNotification(updatedOrder, targetStatus.name());
                } catch (Exception e) {
                        // Don't let notification failure affect order processing
                        org.slf4j.LoggerFactory.getLogger(OrderService.class)
                                        .error("Failed to send push notification: {}", e.getMessage());
                }

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
