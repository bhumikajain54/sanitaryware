package com.example.sanitary.ware.backend.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/**
 * Service to prevent Neon Postgres from sleeping.
 * Runs a simple query every 5 minutes to keep the connection active.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DatabaseKeepAliveService {

    private final JdbcTemplate jdbcTemplate;

    // Runs every 5 minutes (300,000 milliseconds)
    @Scheduled(fixedRate = 300000)
    public void keepDatabaseAlive() {
        try {
            log.debug("Sending heartbeat query to keep Neon Database awake...");
            jdbcTemplate.execute("SELECT 1");
            log.debug("Heartbeat successful.");
        } catch (Exception e) {
            log.warn("Database heartbeat failed: {}", e.getMessage());
        }
    }
}
