package com.example.sanitary.ware.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            System.out.println("No default admin initialization enabled. Register admin via /api/auth/admin/register");
        };
    }
}
