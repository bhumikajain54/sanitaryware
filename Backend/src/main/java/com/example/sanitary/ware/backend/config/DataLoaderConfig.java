package com.example.sanitary.ware.backend.config;

import com.example.sanitary.ware.backend.repositories.FeatureRepository;
import com.example.sanitary.ware.backend.repositories.StatRepository;
import com.example.sanitary.ware.backend.repositories.CMSPageRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataLoaderConfig {

    @Bean
    CommandLineRunner initDatabase(StatRepository statRepository, FeatureRepository featureRepository, CMSPageRepository cmsPageRepository) {
        return args -> {
            // Data loading logic removed as per user request
        };
    }
}
