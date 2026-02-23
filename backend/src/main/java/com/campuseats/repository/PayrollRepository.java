package com.campuseats.repository;

import com.campuseats.model.Payroll;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PayrollRepository extends MongoRepository<Payroll, String> {

    List<Payroll> findByCanteenIdOrderByCreatedAtDesc(String canteenId);

    List<Payroll> findByStatus(String status);

    List<Payroll> findByStatusIn(List<String> statuses);

    Optional<Payroll> findByCanteenIdAndPeriodStartAndPeriodEnd(
            String canteenId, String periodStart, String periodEnd);

    long countByStatus(String status);
}
