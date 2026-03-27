package com.campuseats.controller;

import com.campuseats.dto.AnalyticsOverviewResponse;
import com.campuseats.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/overview")
    public ResponseEntity<AnalyticsOverviewResponse> getOverview(
            @RequestParam(name = "days", required = false, defaultValue = "30") Integer days,
            @RequestParam(name = "canteenId", required = false) String canteenId) {
        AnalyticsOverviewResponse overview = analyticsService.getOverview(days, canteenId);
        return ResponseEntity.ok(overview);
    }
}
