package com.campuseats.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "theme_config")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ThemeConfig {

    @Id
    private String id;

    private String currentTheme; // default, dark, christmas, sinhala-tamil-new-year, ramadan, valentine, halloween, new-year, summer, monsoon

    private String updatedBy;

    private LocalDateTime updatedAt;
}
