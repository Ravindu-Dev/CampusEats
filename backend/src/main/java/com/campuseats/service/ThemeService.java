package com.campuseats.service;

import com.campuseats.model.ThemeConfig;
import com.campuseats.repository.ThemeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class ThemeService {

    private final ThemeRepository themeRepository;

    public String getCurrentTheme() {
        return themeRepository.findFirstByOrderByIdAsc()
                .map(ThemeConfig::getCurrentTheme)
                .orElse("default");
    }

    public ThemeConfig updateTheme(String themeName, String updatedBy) {
        log.info("Updating global theme to: {} by user: {}", themeName, updatedBy);
        
        ThemeConfig config = themeRepository.findFirstByOrderByIdAsc()
                .orElse(new ThemeConfig());
        
        config.setCurrentTheme(themeName);
        config.setUpdatedBy(updatedBy);
        config.setUpdatedAt(LocalDateTime.now());
        
        ThemeConfig saved = themeRepository.save(config);
        log.info("Theme updated successfully in database.");
        return saved;
    }
}
