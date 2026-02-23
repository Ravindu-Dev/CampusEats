package com.campuseats.repository;

import com.campuseats.model.Attendance;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends MongoRepository<Attendance, String> {

    List<Attendance> findByCanteenIdAndDateBetween(String canteenId, LocalDate startDate, LocalDate endDate);

    List<Attendance> findByStaffIdAndDateBetween(String staffId, LocalDate startDate, LocalDate endDate);

    Optional<Attendance> findByStaffIdAndDate(String staffId, LocalDate date);

    List<Attendance> findByCanteenIdAndDate(String canteenId, LocalDate date);

    long countByStaffIdAndDateBetweenAndDayType(String staffId, LocalDate start, LocalDate end, String dayType);
}
