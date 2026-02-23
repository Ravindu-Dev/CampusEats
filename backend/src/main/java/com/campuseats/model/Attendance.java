package com.campuseats.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.index.CompoundIndex;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "attendance")
@Data
@NoArgsConstructor
@AllArgsConstructor
@CompoundIndex(name = "staff_date_idx", def = "{'staffId': 1, 'date': 1}", unique = true)
public class Attendance {

    @Id
    private String id;

    @Indexed
    private String staffId;

    @Indexed
    private String canteenId;

    private LocalDate date;
    private String checkInTime; // HH:mm format
    private String checkOutTime; // HH:mm format
    private Double totalHours;
    private Double overtimeHours;
    private String dayType = "PRESENT"; // PRESENT, ABSENT, HALF_DAY, LEAVE
    private String notes;

    @CreatedDate
    private LocalDateTime createdAt;
}
