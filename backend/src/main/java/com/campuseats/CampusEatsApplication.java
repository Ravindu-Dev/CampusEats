package com.campuseats;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class CampusEatsApplication {

    public static void main(String[] args) {
        SpringApplication.run(CampusEatsApplication.class, args);
    }

}
