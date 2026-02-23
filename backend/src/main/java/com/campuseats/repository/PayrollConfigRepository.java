package com.campuseats.repository;

import com.campuseats.model.PayrollConfig;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PayrollConfigRepository extends MongoRepository<PayrollConfig, String> {
}
