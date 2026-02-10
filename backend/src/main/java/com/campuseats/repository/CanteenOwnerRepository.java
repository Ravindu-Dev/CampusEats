package com.campuseats.repository;

import com.campuseats.model.CanteenOwner;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CanteenOwnerRepository extends MongoRepository<CanteenOwner, String> {

    Optional<CanteenOwner> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<CanteenOwner> findByCanteenId(String canteenId);
}
