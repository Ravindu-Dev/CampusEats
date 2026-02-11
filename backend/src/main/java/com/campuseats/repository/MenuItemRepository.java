package com.campuseats.repository;

import com.campuseats.model.MenuItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends MongoRepository<MenuItem, String> {
    List<MenuItem> findByCanteenId(String canteenId);

    List<MenuItem> findByCanteenIdAndCategory(String canteenId, String category);
}
