package com.example.sanitary.ware.backend.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@RestController
public class RootController {

    @GetMapping("/")
    public Map<String, Object> root() {
        Map<String, Object> status = new HashMap<>();
        status.put("app", "Sanitary Ware Backend");
        status.put("version", "0.0.1-SNAPSHOT");
        status.put("status", "ACTIVE");
        status.put("message", "Service is running successfully. All systems operational.");
        return status;
    }

    @GetMapping("/api/health/ping")
    public String ping() {
        return "pong";
    }
}
