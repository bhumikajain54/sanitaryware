package com.example.sanitary.ware.backend.controllers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth/config")
public class AuthConfigController {

    @Value("${application.security.google.client-id:}")
    private String googleClientId;


    @GetMapping
    public ResponseEntity<Map<String, String>> getConfig() {
        Map<String, String> config = new HashMap<>();
        config.put("googleClientId", googleClientId);
        return ResponseEntity.ok(config);
    }
}
