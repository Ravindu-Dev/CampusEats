package com.campuseats.repository;

import com.campuseats.model.ThemeConfig;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ThemeRepository extends MongoRepository<ThemeConfig, String> {
    Optional<ThemeConfig> findFirstByOrderByIdAsc();
}
