package com.campuseats.repository;

import com.campuseats.model.ComboDeal;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComboDealRepository extends MongoRepository<ComboDeal, String> {
    List<ComboDeal> findByCanteenId(String canteenId);

    List<ComboDeal> findByActiveTrue();

    List<ComboDeal> findByCanteenIdAndActiveTrue(String canteenId);
}
