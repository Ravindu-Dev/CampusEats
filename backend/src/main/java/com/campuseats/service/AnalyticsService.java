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

        List<RevenueTrendDTO> revenueTrend = getRevenueTrend(startDate, canteenId);
        List<UserGrowthDTO> userGrowth = (canteenId == null || canteenId.isEmpty())
                ? getUserGrowth(startDate) : new ArrayList<>();
        List<CanteenPerformanceDTO> topCanteens = (canteenId == null || canteenId.isEmpty())
                ? getTopCanteens(startDate) : new ArrayList<>();

        CanteenPerformanceDTO topCanteen = topCanteens.isEmpty() ? null : topCanteens.get(0);
        List<String> insights = generateInsights(totalRevenue, totalOrders, topCanteen, canteenId);

        return AnalyticsOverviewResponse.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .activeUsers(activeUsers)
                .topCanteen(topCanteen)
                .revenueTrend(revenueTrend)
                .userGrowth(userGrowth)
                .topCanteens(topCanteens)
                .insights(insights)
                .build();
    }

    // ── Revenue ──────────────────────────────────────────────────────────────

    private double getTotalRevenue(LocalDateTime startDate, String canteenId) {
        if (canteenId != null && !canteenId.isEmpty()) {
            // Canteen-specific: unwind items, keep only that canteen's items, sum price*qty
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

        // Platform-wide: one totalAmount per order, no double-counting
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
        Criteria criteria = Criteria.where("createdAt").gte(startDate);
        if (canteenId != null && !canteenId.isEmpty()) {
            criteria.and("orderItems.canteenId").is(canteenId);
        }
        return mongoTemplate.count(new Query(criteria), Order.class);
    }

    // ── Active users ─────────────────────────────────────────────────────────

    private long getActiveUsers(LocalDateTime startDate, String canteenId) {
        Criteria criteria = Criteria.where("createdAt").gte(startDate);
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
            // project date + itemRevenue
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

    /**
     * Uses item-level price×qty to avoid double-counting totalAmount across
     * multiple items in the same order.
     */
    private List<CanteenPerformanceDTO> getTopCanteens(LocalDateTime startDate) {
        List<AggregationOperation> ops = new ArrayList<>();
        ops.add(Aggregation.match(Criteria.where("createdAt").gte(startDate)
                .and("paymentStatus").is("succeeded")));
        ops.add(Aggregation.unwind("orderItems"));
        // project canteenId, canteenName, itemRevenue
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

    // ── Insights ─────────────────────────────────────────────────────────────

    private List<String> generateInsights(double totalRevenue, long totalOrders,
                                          CanteenPerformanceDTO topCanteen, String canteenId) {
        List<String> insights = new ArrayList<>();
        insights.add(String.format("Total revenue for the selected period is \u20b9%.2f.", totalRevenue));
        insights.add(String.format("A total of %d orders were placed.", totalOrders));
        if ((canteenId == null || canteenId.isEmpty()) && topCanteen != null) {
            insights.add(String.format("Top performing canteen: %s with \u20b9%.2f in revenue.",
                    topCanteen.getCanteenName(), topCanteen.getRevenue()));
        }
        if (totalOrders > 0) {
            insights.add(String.format("Average order value is \u20b9%.2f.", totalRevenue / totalOrders));
        }
        return insights;
    }
}
