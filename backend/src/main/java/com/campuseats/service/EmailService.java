package com.campuseats.service;

import com.campuseats.model.Order;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    /**
     * Sends an order confirmation email asynchronously after successful payment.
     * The email includes order details, item list, QR code, and pickup info.
     */
    @Async
    public void sendOrderConfirmationEmail(Order order) {
        if (order.getCustomerEmail() == null || order.getCustomerEmail().isBlank()) {
            logger.warn("Cannot send confirmation email: customer email is empty for order {}", order.getId());
            return;
        }

        if (fromEmail == null || fromEmail.isBlank()) {
            logger.warn("Cannot send confirmation email: MAIL_USERNAME is not configured");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(order.getCustomerEmail());
            helper.setSubject("CampusEats - Order Confirmed! #" + order.getId().substring(order.getId().length() - 6).toUpperCase());
            helper.setText(buildEmailHtml(order), true);

            // Embed QR code as inline CID attachment (Gmail blocks base64 data: URIs)
            if (order.getQrCodeBase64() != null && !order.getQrCodeBase64().isBlank()) {
                try {
                    // Strip the data URI prefix if present (QRCodeService stores it as "data:image/png;base64,...")
                    String base64Data = order.getQrCodeBase64();
                    if (base64Data.contains(",")) {
                        base64Data = base64Data.substring(base64Data.indexOf(",") + 1);
                    }
                    byte[] qrBytes = Base64.getDecoder().decode(base64Data);
                    helper.addInline("qrcode", new ByteArrayResource(qrBytes), "image/png");
                } catch (Exception e) {
                    logger.warn("Failed to attach QR code to email for order {}: {}", order.getId(), e.getMessage());
                }
            }

            // Embed the CampusEats logo as inline CID attachment
            try {
                ClassPathResource logoResource = new ClassPathResource("static/images/logo.png");
                helper.addInline("logo", logoResource, "image/png");
            } catch (Exception e) {
                logger.warn("Failed to attach logo to email for order {}: {}", order.getId(), e.getMessage());
            }

            mailSender.send(message);
            logger.info("Order confirmation email sent to {} for order {}", order.getCustomerEmail(), order.getId());

        } catch (MessagingException e) {
            logger.error("Failed to send order confirmation email to {} for order {}: {}",
                    order.getCustomerEmail(), order.getId(), e.getMessage());
        }
    }

    /**
     * Builds a professional, branded HTML email body for order confirmation.
     */
    private String buildEmailHtml(Order order) {
        StringBuilder itemsHtml = new StringBuilder();
        double subtotal = 0;

        for (Order.OrderItem item : order.getOrderItems()) {
            double itemTotal = item.getPrice() * item.getQuantity();
            subtotal += itemTotal;

            itemsHtml.append(String.format("""
                <tr>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #2a2a3e; color: #e0e0e0; font-size: 14px;">
                        %s
                        <div style="color: #9ca3af; font-size: 12px; margin-top: 2px;">from %s</div>
                    </td>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #2a2a3e; color: #e0e0e0; text-align: center; font-size: 14px;">
                        %d
                    </td>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #2a2a3e; color: #e0e0e0; text-align: right; font-size: 14px;">
                        Rs. %.2f
                    </td>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #2a2a3e; color: #f97316; text-align: right; font-size: 14px; font-weight: 600;">
                        Rs. %.2f
                    </td>
                </tr>
                """, item.getName(), item.getCanteenName(), item.getQuantity(), item.getPrice(), itemTotal));
        }

        // Order type badge
        String orderTypeBadge = order.getOrderType() == Order.OrderType.NOW
                ? "<span style=\"background: linear-gradient(135deg, #22c55e, #16a34a); color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;\">⚡ NOW</span>"
                : "<span style=\"background: linear-gradient(135deg, #3b82f6, #2563eb); color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;\">📅 SCHEDULED</span>";

        // Discount section
        String discountHtml = "";
        if (order.getDiscountAmount() != null && order.getDiscountAmount() > 0) {
            discountHtml = String.format("""
                <tr>
                    <td colspan="3" style="padding: 8px 16px; color: #22c55e; text-align: right; font-size: 14px;">
                        Loyalty Discount (%d pts)
                    </td>
                    <td style="padding: 8px 16px; color: #22c55e; text-align: right; font-size: 14px; font-weight: 600;">
                        - Rs. %.2f
                    </td>
                </tr>
                """, order.getLoyaltyPointsRedeemed() != null ? order.getLoyaltyPointsRedeemed() : 0,
                    order.getDiscountAmount());
        }

        // QR code section — uses CID reference (inline attachment added in sendOrderConfirmationEmail)
        String qrCodeHtml = "";
        if (order.getQrCodeBase64() != null && !order.getQrCodeBase64().isBlank()) {
            qrCodeHtml = """
                <div style="text-align: center; margin: 24px 0;">
                    <p style="color: #9ca3af; font-size: 13px; margin-bottom: 12px;">Show this QR code at the counter for pickup</p>
                    <img src="cid:qrcode" alt="Order QR Code" width="180" height="180"
                         style="border-radius: 12px; border: 2px solid #2a2a3e;" />
                </div>
                """;
        }

        // Format created date
        String orderDate = order.getCreatedAt() != null
                ? order.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' hh:mm a"))
                : "N/A";

        String shortOrderId = order.getId().substring(order.getId().length() - 6).toUpperCase();

        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; background-color: #0f0f1a; font-family: 'Segoe UI', Arial, Helvetica, sans-serif;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a2e;">

                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 32px 24px; text-align: center;">
                        <img src="cid:logo" alt="CampusEats" height="50" style="display: inline-block; margin-bottom: 8px;" />
                        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 15px;">
                            Order Confirmed & Payment Successful
                        </p>
                    </div>

                    <!-- Success Banner -->
                    <div style="background: linear-gradient(135deg, #065f46, #064e3b); padding: 20px 24px; text-align: center;">
                        <div style="font-size: 36px; margin-bottom: 8px;">✅</div>
                        <p style="color: #34d399; font-size: 18px; font-weight: 600; margin: 0;">
                            Payment Successful!
                        </p>
                        <p style="color: #a7f3d0; font-size: 13px; margin: 6px 0 0;">
                            Your order is now being processed
                        </p>
                    </div>

                    <!-- Order Info -->
                    <div style="padding: 24px;">

                        <!-- Greeting -->
                        <p style="color: #e0e0e0; font-size: 15px; margin: 0 0 20px;">
                            Hi <strong style="color: #f97316;">%s</strong>, thank you for your order! 🎉
                        </p>

                        <!-- Order Details Card -->
                        <div style="background-color: #16162a; border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #2a2a3e;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
                                <div>
                                    <p style="color: #9ca3af; font-size: 12px; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Order ID</p>
                                    <p style="color: #f97316; font-size: 18px; font-weight: 700; margin: 4px 0 0; letter-spacing: 1px;">#%s</p>
                                </div>
                            </div>

                            <table width="100%%" cellpadding="0" cellspacing="0" style="margin-bottom: 8px;">
                                <tr>
                                    <td style="padding: 6px 0;">
                                        <span style="color: #9ca3af; font-size: 13px;">📅 Order Date:</span>
                                        <span style="color: #e0e0e0; font-size: 13px; margin-left: 8px;">%s</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0;">
                                        <span style="color: #9ca3af; font-size: 13px;">📦 Order Type:</span>
                                        <span style="margin-left: 8px;">%s</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0;">
                                        <span style="color: #9ca3af; font-size: 13px;">🕐 Pickup:</span>
                                        <span style="color: #e0e0e0; font-size: 13px; margin-left: 8px;">%s at %s</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0;">
                                        <span style="color: #9ca3af; font-size: 13px;">📞 Phone:</span>
                                        <span style="color: #e0e0e0; font-size: 13px; margin-left: 8px;">%s</span>
                                    </td>
                                </tr>
                            </table>
                        </div>

                        <!-- Items Table -->
                        <div style="background-color: #16162a; border-radius: 12px; overflow: hidden; margin-bottom: 20px; border: 1px solid #2a2a3e;">
                            <div style="padding: 16px; border-bottom: 1px solid #2a2a3e;">
                                <h3 style="color: #f97316; margin: 0; font-size: 16px; font-weight: 600;">🛒 Order Items</h3>
                            </div>
                            <table width="100%%" cellpadding="0" cellspacing="0">
                                <thead>
                                    <tr style="background-color: #0f0f1a;">
                                        <th style="padding: 10px 16px; color: #9ca3af; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Item</th>
                                        <th style="padding: 10px 16px; color: #9ca3af; text-align: center; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Qty</th>
                                        <th style="padding: 10px 16px; color: #9ca3af; text-align: right; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Price</th>
                                        <th style="padding: 10px 16px; color: #9ca3af; text-align: right; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    %s
                                </tbody>
                            </table>

                            <!-- Totals -->
                            <div style="border-top: 2px solid #2a2a3e;">
                                <table width="100%%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td colspan="3" style="padding: 8px 16px; color: #9ca3af; text-align: right; font-size: 14px;">
                                            Subtotal
                                        </td>
                                        <td style="padding: 8px 16px; color: #e0e0e0; text-align: right; font-size: 14px;">
                                            Rs. %.2f
                                        </td>
                                    </tr>
                                    %s
                                    <tr style="background-color: #0f0f1a;">
                                        <td colspan="3" style="padding: 14px 16px; color: #ffffff; text-align: right; font-size: 16px; font-weight: 700;">
                                            Total Paid
                                        </td>
                                        <td style="padding: 14px 16px; color: #f97316; text-align: right; font-size: 18px; font-weight: 700;">
                                            Rs. %.2f
                                        </td>
                                    </tr>
                                </table>
                            </div>
                        </div>

                        <!-- QR Code -->
                        %s

                        <!-- Status Info -->
                        <div style="background: linear-gradient(135deg, #1e1b4b, #312e81); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px;">
                            <p style="color: #c4b5fd; font-size: 14px; margin: 0 0 8px;">
                                📱 Track your order status in the CampusEats app
                            </p>
                            <p style="color: #a5b4fc; font-size: 12px; margin: 0;">
                                You'll receive notifications as your order is prepared
                            </p>
                        </div>

                    </div>

                    <!-- Footer -->
                    <div style="background-color: #0f0f1a; padding: 24px; text-align: center; border-top: 1px solid #2a2a3e;">
                        <img src="cid:logo" alt="CampusEats" height="32" style="display: inline-block; margin-bottom: 8px;" />
                        <p style="color: #6b7280; font-size: 12px; margin: 0 0 4px;">
                            Campus Food Delivery & Canteen Pre-order System
                        </p>
                        <p style="color: #4b5563; font-size: 11px; margin: 12px 0 0;">
                            This is an automated email. Please do not reply directly to this message.
                        </p>
                    </div>

                </div>
            </body>
            </html>
            """,
                order.getCustomerName() != null ? order.getCustomerName() : "Customer",
                shortOrderId,
                orderDate,
                orderTypeBadge,
                order.getPickupDate() != null ? order.getPickupDate() : "N/A",
                order.getPickupTime() != null ? order.getPickupTime() : "N/A",
                order.getCustomerPhone() != null ? order.getCustomerPhone() : "N/A",
                itemsHtml.toString(),
                subtotal,
                discountHtml,
                order.getTotalAmount(),
                qrCodeHtml);
    }
}
