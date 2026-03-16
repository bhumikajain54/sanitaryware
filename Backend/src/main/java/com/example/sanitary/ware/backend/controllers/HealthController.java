package com.example.sanitary.ware.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/db")
    public Map<String, Object> checkDatabase() {
        Map<String, Object> status = new HashMap<>();
        try {
            jdbcTemplate.execute("SELECT 1");
            status.put("status", "SUCCESS");
            status.put("message", "Connected to Neon PostgreSQL!");
            status.put("database", "neondb");
        } catch (Exception e) {
            status.put("status", "ERROR");
            status.put("message", e.getMessage());
        }
        return status;
    }
}
