package com.campuseats.repository;

import com.campuseats.model.LoyaltyAccount;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LoyaltyAccountRepository extends MongoRepository<LoyaltyAccount, String> {
    Optional<LoyaltyAccount> findByUserId(String userId);
}
