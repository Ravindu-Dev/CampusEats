package com.campuseats.controller;

import com.campuseats.model.ThemeConfig;
import com.campuseats.service.ThemeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class ThemeController {

    private final ThemeService themeService;

    @GetMapping("/theme")
    public ResponseEntity<Map<String, String>> getCurrentTheme() {
        String theme = themeService.getCurrentTheme();
        Map<String, String> response = new HashMap<>();
        response.put("theme", theme);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin/theme")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ThemeConfig> updateTheme(@RequestBody Map<String, String> request, Authentication authentication) {
        String themeName = request.get("theme");
        String adminEmail = (authentication != null) ? authentication.getName() : "admin-auto";
        return ResponseEntity.ok(themeService.updateTheme(themeName, adminEmail));
    }
}
