package com.example.sanitary.ware.backend.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getNotifications() {
        // Returning an empty list for now so the frontend doesn't crash
        return ResponseEntity.ok(new ArrayList<>());
    }

    @GetMapping("/admin")
    public ResponseEntity<List<Map<String, Object>>> getAdminNotifications() {
        // Returning an empty list for now so the frontend doesn't crash
        // In a real app, this would fetch from a database
        return ResponseEntity.ok(new ArrayList<>());
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<Void> markAllRead() {
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable String id) {
        return ResponseEntity.ok().build();
    }
}
