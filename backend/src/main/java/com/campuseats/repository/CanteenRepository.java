package com.campuseats.repository;

import com.campuseats.model.Canteen;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CanteenRepository extends MongoRepository<Canteen, String> {

    Optional<Canteen> findByEmail(String email);

    List<Canteen> findByStatus(String status);

    Optional<Canteen> findByOwnerId(String ownerId);

    boolean existsByEmail(String email);
}
