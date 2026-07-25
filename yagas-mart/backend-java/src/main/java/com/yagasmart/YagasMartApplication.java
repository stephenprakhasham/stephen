package com.yagasmart;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class YagasMartApplication {

    public static void main(String[] args) {
        System.out.println("Starting Yaga's Mart, Sendurai Content Pipeline System (Java 24 + Spring Boot)...");
        SpringApplication.run(YagasMartApplication.class, args);
    }
}
