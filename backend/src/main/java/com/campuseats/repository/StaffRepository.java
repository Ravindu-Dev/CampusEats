package com.campuseats.repository;

import com.campuseats.model.Staff;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StaffRepository extends MongoRepository<Staff, String> {

    List<Staff> findByCanteenId(String canteenId);

    List<Staff> findByCanteenIdAndStatus(String canteenId, String status);

    long countByCanteenId(String canteenId);

    long countByCanteenIdAndStatus(String canteenId, String status);
}
