package com.campuseats.service;

import com.campuseats.dto.LoyaltyAccountResponse;
import com.campuseats.model.LoyaltyAccount;
import com.campuseats.model.Order;
import com.campuseats.repository.LoyaltyAccountRepository;
import com.campuseats.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LoyaltyService {

    private final LoyaltyAccountRepository loyaltyAccountRepository;
    private final OrderRepository orderRepository;

    // Points configuration
    private static final int POINTS_PER_RUPEES = 10; // 1 point per Rs. 10 spent
    private static final int SILVER_THRESHOLD = 500;
    private static final int GOLD_THRESHOLD = 2000;
    private static final int PLATINUM_THRESHOLD = 5000;

    // ── Earn Points ──

    public void earnPoints(String userId, String orderId, Double orderAmount) {
        LoyaltyAccount account = getOrCreateAccount(userId);

        int pointsEarned = (int) (orderAmount / POINTS_PER_RUPEES);
        if (pointsEarned <= 0)
            return;

        account.setTotalPoints(account.getTotalPoints() + pointsEarned);
        account.setLifetimePoints(account.getLifetimePoints() + pointsEarned);

        // Update tier
        account.setTier(calculateTier(account.getLifetimePoints()));

        // Update weekly spending
        updateWeeklySpending(account, userId, orderId);

        // Add transaction
        LoyaltyAccount.LoyaltyTransaction transaction = new LoyaltyAccount.LoyaltyTransaction();
        transaction.setType("EARN");
        transaction.setPoints(pointsEarned);
        transaction.setOrderId(orderId);
        transaction.setDescription("Earned " + pointsEarned + " points from order");
        transaction.setTimestamp(LocalDateTime.now());

        List<LoyaltyAccount.LoyaltyTransaction> transactions = account.getTransactions();
        transactions.add(0, transaction);
        // Keep only last 50 transactions
        if (transactions.size() > 50) {
            account.setTransactions(new ArrayList<>(transactions.subList(0, 50)));
        }

        loyaltyAccountRepository.save(account);
    }

    // ── Redeem Points ──

    public Double redeemPoints(String userId, Integer points) {
        LoyaltyAccount account = getOrCreateAccount(userId);

        if (points > account.getTotalPoints()) {
            throw new RuntimeException("Insufficient loyalty points. Available: " + account.getTotalPoints());
        }

        account.setTotalPoints(account.getTotalPoints() - points);

        // Add transaction
        LoyaltyAccount.LoyaltyTransaction transaction = new LoyaltyAccount.LoyaltyTransaction();
        transaction.setType("REDEEM");
        transaction.setPoints(points);
        transaction.setDescription("Redeemed " + points + " points for Rs. " + points + " discount");
        transaction.setTimestamp(LocalDateTime.now());

        List<LoyaltyAccount.LoyaltyTransaction> transactions = account.getTransactions();
        transactions.add(0, transaction);
        if (transactions.size() > 50) {
            account.setTransactions(new ArrayList<>(transactions.subList(0, 50)));
        }

        loyaltyAccountRepository.save(account);

        // 1 point = Rs. 1 discount
        return (double) points;
    }

    // ── Get Account ──

    public LoyaltyAccountResponse getAccount(String userId) {
        LoyaltyAccount account = getOrCreateAccount(userId);

        // Refresh weekly spending from orders
        refreshWeeklySpending(account, userId);

        LoyaltyAccountResponse response = new LoyaltyAccountResponse();
        response.setUserId(account.getUserId());
        response.setTotalPoints(account.getTotalPoints());
        response.setLifetimePoints(account.getLifetimePoints());
        response.setTier(account.getTier().name());
        response.setWeeklySpending(account.getWeeklySpending());
        response.setTotalWeeklySpending(
                account.getWeeklySpending().values().stream().mapToDouble(Double::doubleValue).sum());

        // Next tier info
        setNextTierInfo(response, account);

        // Recent transactions
        List<LoyaltyAccountResponse.TransactionResponse> txResponses = account.getTransactions().stream()
                .limit(20)
                .map(tx -> {
                    LoyaltyAccountResponse.TransactionResponse tr = new LoyaltyAccountResponse.TransactionResponse();
                    tr.setType(tx.getType());
                    tr.setPoints(tx.getPoints());
                    tr.setOrderId(tx.getOrderId());
                    tr.setDescription(tx.getDescription());
                    tr.setTimestamp(tx.getTimestamp());
                    return tr;
                })
                .collect(Collectors.toList());

        response.setRecentTransactions(txResponses);

        return response;
    }

    // ── Get Weekly Spending ──

    public Map<String, Double> getWeeklySpending(String userId) {
        LoyaltyAccount account = getOrCreateAccount(userId);
        refreshWeeklySpending(account, userId);
        return account.getWeeklySpending();
    }

    // ── Private Helpers ──

    private LoyaltyAccount getOrCreateAccount(String userId) {
        return loyaltyAccountRepository.findByUserId(userId)
                .orElseGet(() -> {
                    LoyaltyAccount newAccount = new LoyaltyAccount();
                    newAccount.setUserId(userId);
                    newAccount.setTotalPoints(0);
                    newAccount.setLifetimePoints(0);
                    newAccount.setTier(LoyaltyAccount.LoyaltyTier.BRONZE);
                    newAccount.setWeeklySpending(new HashMap<>());
                    newAccount.setWeekStart(getWeekStart());
                    newAccount.setTransactions(new ArrayList<>());
                    return loyaltyAccountRepository.save(newAccount);
                });
    }

    private void refreshWeeklySpending(LoyaltyAccount account, String userId) {
        LocalDateTime currentWeekStart = getWeekStart();

        // Reset weekly spending if a new week has started
        if (account.getWeekStart() == null || account.getWeekStart().isBefore(currentWeekStart)) {
            account.setWeekStart(currentWeekStart);
            account.setWeeklySpending(new HashMap<>());
        }

        // Recalculate from orders
        List<Order> weekOrders = orderRepository.findByUserIdAndPaymentStatusAndCreatedAtAfter(
                userId, "succeeded", currentWeekStart);

        Map<String, Double> spending = new HashMap<>();
        for (Order order : weekOrders) {
            for (Order.OrderItem item : order.getOrderItems()) {
                spending.merge(item.getCanteenId(), item.getPrice() * item.getQuantity(), Double::sum);
            }
        }

        account.setWeeklySpending(spending);
        loyaltyAccountRepository.save(account);
    }

    private void updateWeeklySpending(LoyaltyAccount account, String userId, String orderId) {
        LocalDateTime currentWeekStart = getWeekStart();

        if (account.getWeekStart() == null || account.getWeekStart().isBefore(currentWeekStart)) {
            account.setWeekStart(currentWeekStart);
            account.setWeeklySpending(new HashMap<>());
        }

        // We'll do a full refresh to be accurate
        refreshWeeklySpending(account, userId);
    }

    private LocalDateTime getWeekStart() {
        return LocalDateTime.now()
                .with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
                .withHour(0).withMinute(0).withSecond(0).withNano(0);
    }

    private LoyaltyAccount.LoyaltyTier calculateTier(int lifetimePoints) {
        if (lifetimePoints >= PLATINUM_THRESHOLD)
            return LoyaltyAccount.LoyaltyTier.PLATINUM;
        if (lifetimePoints >= GOLD_THRESHOLD)
            return LoyaltyAccount.LoyaltyTier.GOLD;
        if (lifetimePoints >= SILVER_THRESHOLD)
            return LoyaltyAccount.LoyaltyTier.SILVER;
        return LoyaltyAccount.LoyaltyTier.BRONZE;
    }

    private void setNextTierInfo(LoyaltyAccountResponse response, LoyaltyAccount account) {
        switch (account.getTier()) {
            case BRONZE:
                response.setNextTier("SILVER");
                response.setPointsToNextTier(SILVER_THRESHOLD - account.getLifetimePoints());
                break;
            case SILVER:
                response.setNextTier("GOLD");
                response.setPointsToNextTier(GOLD_THRESHOLD - account.getLifetimePoints());
                break;
            case GOLD:
                response.setNextTier("PLATINUM");
                response.setPointsToNextTier(PLATINUM_THRESHOLD - account.getLifetimePoints());
                break;
            case PLATINUM:
                response.setNextTier(null);
                response.setPointsToNextTier(0);
                break;
        }
    }
}
