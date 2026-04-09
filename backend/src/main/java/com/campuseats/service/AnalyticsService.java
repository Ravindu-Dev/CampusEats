package com.campuseats.service;

import com.campuseats.dto.*;
import com.campuseats.model.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.*;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsService {

    private final MongoTemplate mongoTemplate;

    public AnalyticsOverviewResponse getOverview(Integer days, String canteenId) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days != null ? days : 30);

        long totalOrders = getTotalOrders(startDate, canteenId);
        double totalRevenue = getTotalRevenue(startDate, canteenId);
        long activeUsers = getActiveUsers(startDate, canteenId);
        double averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0.0;

        List<RevenueTrendDTO> revenueTrend = getRevenueTrend(startDate, canteenId);
        List<UserGrowthDTO> userGrowth = (canteenId == null || canteenId.isEmpty())
                ? getUserGrowth(startDate) : new ArrayList<>();
        List<CanteenPerformanceDTO> topCanteens = (canteenId == null || canteenId.isEmpty())
                ? getTopCanteens(startDate) : new ArrayList<>();

        CanteenPerformanceDTO topCanteen = topCanteens.isEmpty() ? null : topCanteens.get(0);
        List<String> insights = generateInsights(totalRevenue, totalOrders, averageOrderValue, topCanteen, canteenId);

        // ── New metrics ────────────────────────────────────────────────────────
        List<HourlyDistributionDTO> hourlyDistribution = getHourlyDistribution(startDate, canteenId);
        List<ProductPerformanceDTO> topSellingProducts = getTopSellingProducts(startDate, canteenId);
        ProductPerformanceDTO bestSeller = topSellingProducts.isEmpty() ? null : topSellingProducts.get(0);
        List<CanteenSatisfactionDTO> canteenSatisfaction = getCanteenSatisfaction(startDate, canteenId);
        FulfillmentStatsDTO fulfillmentStats = getFulfillmentStats(startDate, canteenId);
        double repeatOrderRate = getRepeatOrderRate(startDate, canteenId);
        long atRiskCustomers = getAtRiskCustomers(startDate, canteenId);

        return AnalyticsOverviewResponse.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .activeUsers(activeUsers)
                .topCanteen(topCanteen)
                .revenueTrend(revenueTrend)
                .userGrowth(userGrowth)
                .topCanteens(topCanteens)
                .insights(insights)
                .hourlyDistribution(hourlyDistribution)
                .topSellingProducts(topSellingProducts)
                .bestSeller(bestSeller)
                .canteenSatisfaction(canteenSatisfaction)
                .fulfillmentStats(fulfillmentStats)
                .repeatOrderRate(repeatOrderRate)
                .atRiskCustomers(atRiskCustomers)
                .build();
    }

    // ── Revenue ──────────────────────────────────────────────────────────────

    private double getTotalRevenue(LocalDateTime startDate, String canteenId) {
        if (canteenId != null && !canteenId.isEmpty()) {
            List<AggregationOperation> ops = new ArrayList<>();
            ops.add(Aggregation.match(Criteria.where("createdAt").gte(startDate)
                    .and("paymentStatus").is("succeeded")));
            ops.add(Aggregation.unwind("orderItems"));
            ops.add(Aggregation.match(Criteria.where("orderItems.canteenId").is(canteenId)));
            ops.add(context -> new Document("$group", new Document("_id", null)
                    .append("totalRevenue", new Document("$sum",
                            new Document("$multiply", Arrays.asList("$orderItems.price", "$orderItems.quantity"))))));

            AggregationResults<Document> r = mongoTemplate.aggregate(
                    Aggregation.newAggregation(ops), "orders", Document.class);
            Document result = r.getUniqueMappedResult();
            return result != null && result.get("totalRevenue") != null
                    ? ((Number) result.get("totalRevenue")).doubleValue() : 0.0;
        }

        Aggregation agg = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("createdAt").gte(startDate)
                        .and("paymentStatus").is("succeeded")),
                Aggregation.group().sum("totalAmount").as("totalRevenue")
        );
        AggregationResults<Document> results = mongoTemplate.aggregate(agg, "orders", Document.class);
        Document result = results.getUniqueMappedResult();
        return result != null && result.get("totalRevenue") != null
                ? ((Number) result.get("totalRevenue")).doubleValue() : 0.0;
    }

    // ── Order count ──────────────────────────────────────────────────────────

    private long getTotalOrders(LocalDateTime startDate, String canteenId) {
        Criteria criteria = Criteria.where("createdAt").gte(startDate).and("paymentStatus").is("succeeded");
        if (canteenId != null && !canteenId.isEmpty()) {
            criteria.and("orderItems.canteenId").is(canteenId);
        }
        return mongoTemplate.count(new Query(criteria), Order.class);
    }

    // ── Active users ─────────────────────────────────────────────────────────

    private long getActiveUsers(LocalDateTime startDate, String canteenId) {
        Criteria criteria = Criteria.where("createdAt").gte(startDate).and("paymentStatus").is("succeeded");
        if (canteenId != null && !canteenId.isEmpty()) {
            criteria.and("orderItems.canteenId").is(canteenId);
        }
        List<String> distinct = mongoTemplate.findDistinct(new Query(criteria), "userId", Order.class, String.class);
        return distinct.size();
    }

    // ── Revenue trend ────────────────────────────────────────────────────────

    private List<RevenueTrendDTO> getRevenueTrend(LocalDateTime startDate, String canteenId) {
        if (canteenId != null && !canteenId.isEmpty()) {
            List<AggregationOperation> ops = new ArrayList<>();
            ops.add(Aggregation.match(Criteria.where("createdAt").gte(startDate)
                    .and("paymentStatus").is("succeeded")));
            ops.add(Aggregation.unwind("orderItems"));
            ops.add(Aggregation.match(Criteria.where("orderItems.canteenId").is(canteenId)));
            ops.add(context -> new Document("$project", new Document()
                    .append("date", new Document("$dateToString",
                            new Document("format", "%Y-%m-%d").append("date", "$createdAt")))
                    .append("revenue", new Document("$multiply",
                            Arrays.asList("$orderItems.price", "$orderItems.quantity")))));
            ops.add(context -> new Document("$group", new Document("_id", "$date")
                    .append("revenue", new Document("$sum", "$revenue"))
                    .append("orderCount", new Document("$sum", 1))));
            ops.add(context -> new Document("$project", new Document("_id", 0)
                    .append("date", "$_id")
                    .append("revenue", 1)
                    .append("orderCount", 1)));
            ops.add(Aggregation.sort(Sort.Direction.ASC, "date"));

            return mongoTemplate.aggregate(Aggregation.newAggregation(ops), "orders", RevenueTrendDTO.class)
                    .getMappedResults();
        }

        Aggregation agg = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("createdAt").gte(startDate)
                        .and("paymentStatus").is("succeeded")),
                Aggregation.project()
                        .andExpression("{$dateToString: {format: '%Y-%m-%d', date: '$createdAt'}}").as("date")
                        .and("totalAmount").as("revenue"),
                Aggregation.group("date")
                        .sum("revenue").as("revenue")
                        .count().as("orderCount"),
                Aggregation.project("orderCount", "revenue").and("_id").as("date"),
                Aggregation.sort(Sort.Direction.ASC, "date")
        );
        return mongoTemplate.aggregate(agg, "orders", RevenueTrendDTO.class).getMappedResults();
    }

    // ── User growth ──────────────────────────────────────────────────────────

    private List<UserGrowthDTO> getUserGrowth(LocalDateTime startDate) {
        Aggregation agg = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("createdAt").gte(startDate)),
                Aggregation.project()
                        .andExpression("{$dateToString: {format: '%Y-%m-%d', date: '$createdAt'}}").as("date"),
                Aggregation.group("date").count().as("newUsers"),
                Aggregation.project("newUsers").and("_id").as("date"),
                Aggregation.sort(Sort.Direction.ASC, "date")
        );
        return mongoTemplate.aggregate(agg, "users", UserGrowthDTO.class).getMappedResults();
    }

    // ── Top canteens ─────────────────────────────────────────────────────────

    private List<CanteenPerformanceDTO> getTopCanteens(LocalDateTime startDate) {
        List<AggregationOperation> ops = new ArrayList<>();
        ops.add(Aggregation.match(Criteria.where("createdAt").gte(startDate)
                .and("paymentStatus").is("succeeded")));
        ops.add(Aggregation.unwind("orderItems"));
        ops.add(context -> new Document("$project", new Document()
                .append("canteenId", "$orderItems.canteenId")
                .append("canteenName", "$orderItems.canteenName")
                .append("itemRevenue", new Document("$multiply",
                        Arrays.asList("$orderItems.price", "$orderItems.quantity")))));
        ops.add(context -> new Document("$group", new Document("_id", "$canteenId")
                .append("revenue", new Document("$sum", "$itemRevenue"))
                .append("totalOrders", new Document("$sum", 1))
                .append("canteenName", new Document("$first", "$canteenName"))));
        ops.add(context -> new Document("$project", new Document("_id", 0)
                .append("canteenId", "$_id")
                .append("revenue", 1)
                .append("totalOrders", 1)
                .append("canteenName", 1)));
        ops.add(Aggregation.sort(Sort.Direction.DESC, "revenue"));
        ops.add(Aggregation.limit(5));

        return mongoTemplate.aggregate(Aggregation.newAggregation(ops), "orders", CanteenPerformanceDTO.class)
                .getMappedResults();
    }

    // ── Peak Hours ────────────────────────────────────────────────────────────

    private List<HourlyDistributionDTO> getHourlyDistribution(LocalDateTime startDate, String canteenId) {
        List<AggregationOperation> ops = new ArrayList<>();
        Criteria criteria = Criteria.where("createdAt").gte(startDate);
        if (canteenId != null && !canteenId.isEmpty()) {
            criteria.and("orderItems.canteenId").is(canteenId);
        }
        ops.add(Aggregation.match(criteria));
        ops.add(context -> new Document("$project", new Document()
                .append("hour", new Document("$hour", "$createdAt"))));
        ops.add(context -> new Document("$group", new Document("_id", "$hour")
                .append("orderCount", new Document("$sum", 1))));
        ops.add(context -> new Document("$project", new Document("_id", 0)
                .append("hour", "$_id")
                .append("orderCount", 1)));
        ops.add(Aggregation.sort(Sort.Direction.ASC, "hour"));
        return mongoTemplate.aggregate(Aggregation.newAggregation(ops), "orders", HourlyDistributionDTO.class)
                .getMappedResults();
    }

    // ── Top Selling Products ───────────────────────────────────────────────────

    private List<ProductPerformanceDTO> getTopSellingProducts(LocalDateTime startDate, String canteenId) {
        List<AggregationOperation> ops = new ArrayList<>();
        ops.add(Aggregation.match(Criteria.where("createdAt").gte(startDate)
                .and("paymentStatus").is("succeeded")));
        ops.add(Aggregation.unwind("orderItems"));
        if (canteenId != null && !canteenId.isEmpty()) {
            ops.add(Aggregation.match(Criteria.where("orderItems.canteenId").is(canteenId)));
        }
        ops.add(context -> new Document("$group", new Document("_id", "$orderItems.name")
                .append("totalSold", new Document("$sum", "$orderItems.quantity"))
                .append("revenue", new Document("$sum",
                        new Document("$multiply", Arrays.asList("$orderItems.price", "$orderItems.quantity"))))
                .append("canteenName", new Document("$first", "$orderItems.canteenName"))));
        ops.add(context -> new Document("$project", new Document("_id", 0)
                .append("productName", "$_id")
                .append("totalSold", 1)
                .append("revenue", 1)
                .append("canteenName", 1)));
        ops.add(Aggregation.sort(Sort.Direction.DESC, "totalSold"));
        ops.add(Aggregation.limit(10));
        return mongoTemplate.aggregate(Aggregation.newAggregation(ops), "orders", ProductPerformanceDTO.class)
                .getMappedResults();
    }

    // ── Canteen Satisfaction (from reviews) ───────────────────────────────────

    private List<CanteenSatisfactionDTO> getCanteenSatisfaction(LocalDateTime startDate, String canteenId) {
        List<AggregationOperation> ops = new ArrayList<>();
        Criteria criteria = Criteria.where("createdAt").gte(startDate);
        if (canteenId != null && !canteenId.isEmpty()) {
            criteria.and("canteenId").is(canteenId);
        }
        ops.add(Aggregation.match(criteria));
        ops.add(context -> new Document("$group", new Document("_id", "$canteenId")
                .append("canteenName", new Document("$first", "$canteenName"))
                .append("averageRating", new Document("$avg", "$rating"))
                .append("reviewCount", new Document("$sum", 1))));
        ops.add(context -> new Document("$project", new Document("_id", 0)
                .append("canteenId", "$_id")
                .append("canteenName", 1)
                .append("averageRating", new Document("$round", Arrays.asList("$averageRating", 1)))
                .append("reviewCount", 1)));
        ops.add(Aggregation.sort(Sort.Direction.DESC, "averageRating"));
        return mongoTemplate.aggregate(Aggregation.newAggregation(ops), "reviews", CanteenSatisfactionDTO.class)
                .getMappedResults();
    }

    // ── Fulfillment & Kitchen Efficiency ──────────────────────────────────────

    private FulfillmentStatsDTO getFulfillmentStats(LocalDateTime startDate, String canteenId) {
        List<AggregationOperation> ops = new ArrayList<>();
        Criteria criteria = Criteria.where("createdAt").gte(startDate)
                .and("readyAt").exists(true)
                .and("completedAt").exists(true);
        if (canteenId != null && !canteenId.isEmpty()) {
            criteria.and("orderItems.canteenId").is(canteenId);
        }
        ops.add(Aggregation.match(criteria));
        ops.add(context -> new Document("$project", new Document()
                .append("waitMinutes", new Document("$divide", Arrays.asList(
                        new Document("$subtract", Arrays.asList("$readyAt", "$createdAt")), 60000)))
                .append("pickupDelayMinutes", new Document("$divide", Arrays.asList(
                        new Document("$subtract", Arrays.asList("$completedAt", "$readyAt")), 60000)))));
        ops.add(context -> new Document("$group", new Document("_id", null)
                .append("avgWaitMinutes", new Document("$avg", "$waitMinutes"))
                .append("avgPickupDelayMinutes", new Document("$avg", "$pickupDelayMinutes"))
                .append("sampleCount", new Document("$sum", 1))));

        AggregationResults<Document> results = mongoTemplate.aggregate(
                Aggregation.newAggregation(ops), "orders", Document.class);
        Document doc = results.getUniqueMappedResult();
        if (doc == null) {
            return FulfillmentStatsDTO.builder()
                    .avgWaitMinutes(0.0).avgPickupDelayMinutes(0.0).sampleCount(0L).build();
        }
        return FulfillmentStatsDTO.builder()
                .avgWaitMinutes(doc.get("avgWaitMinutes") != null
                        ? Math.round(((Number) doc.get("avgWaitMinutes")).doubleValue() * 10.0) / 10.0 : 0.0)
                .avgPickupDelayMinutes(doc.get("avgPickupDelayMinutes") != null
                        ? Math.round(((Number) doc.get("avgPickupDelayMinutes")).doubleValue() * 10.0) / 10.0 : 0.0)
                .sampleCount(doc.get("sampleCount") != null
                        ? ((Number) doc.get("sampleCount")).longValue() : 0L)
                .build();
    }

    // ── Customer Retention: Repeat Order Rate ─────────────────────────────────

    private double getRepeatOrderRate(LocalDateTime startDate, String canteenId) {
        Criteria criteria = Criteria.where("createdAt").gte(startDate);
        if (canteenId != null && !canteenId.isEmpty()) {
            criteria.and("orderItems.canteenId").is(canteenId);
        }
        List<AggregationOperation> ops = new ArrayList<>();
        ops.add(Aggregation.match(criteria));
        ops.add(context -> new Document("$group", new Document("_id", "$userId")
                .append("orderCount", new Document("$sum", 1))));
        ops.add(context -> new Document("$group", new Document("_id", null)
                .append("totalUsers", new Document("$sum", 1))
                .append("repeatUsers", new Document("$sum",
                        new Document("$cond", Arrays.asList(
                                new Document("$gt", Arrays.asList("$orderCount", 1)), 1, 0))))));
        AggregationResults<Document> results = mongoTemplate.aggregate(
                Aggregation.newAggregation(ops), "orders", Document.class);
        Document doc = results.getUniqueMappedResult();
        if (doc == null) return 0.0;
        long total = ((Number) doc.get("totalUsers")).longValue();
        long repeat = ((Number) doc.get("repeatUsers")).longValue();
        return total == 0 ? 0.0 : Math.round((repeat * 100.0 / total) * 10.0) / 10.0;
    }

    // ── Customer Retention: At-Risk Customers ─────────────────────────────────

    private long getAtRiskCustomers(LocalDateTime startDate, String canteenId) {
        LocalDateTime tenDaysAgo = LocalDateTime.now().minusDays(10);
        Criteria allCriteria = Criteria.where("createdAt").gte(startDate);
        if (canteenId != null && !canteenId.isEmpty()) {
            allCriteria.and("orderItems.canteenId").is(canteenId);
        }
        List<String> allUsers = mongoTemplate.findDistinct(
                new Query(allCriteria), "userId", Order.class, String.class);
        Criteria recentCriteria = Criteria.where("createdAt").gte(tenDaysAgo);
        if (canteenId != null && !canteenId.isEmpty()) {
            recentCriteria.and("orderItems.canteenId").is(canteenId);
        }
        List<String> recentUsers = mongoTemplate.findDistinct(
                new Query(recentCriteria), "userId", Order.class, String.class);
        return allUsers.stream().filter(u -> !recentUsers.contains(u)).count();
    }

    // ── Insights ─────────────────────────────────────────────────────────────

    private List<String> generateInsights(double totalRevenue, long totalOrders, double averageOrderValue,
                                          CanteenPerformanceDTO topCanteen, String canteenId) {
        List<String> insights = new ArrayList<>();
        insights.add(String.format("Total revenue for the selected period is Rs. %.2f.", totalRevenue));
        insights.add(String.format("A total of %d orders were placed.", totalOrders));
        if (totalOrders > 0) {
            insights.add(String.format("Average order value is Rs. %.2f.", averageOrderValue));
        }
        if ((canteenId == null || canteenId.isEmpty()) && topCanteen != null) {
            insights.add(String.format("Top performing canteen: %s with Rs. %.2f in revenue.",
                    topCanteen.getCanteenName(), topCanteen.getRevenue()));
        }
        return insights;
    }
}
