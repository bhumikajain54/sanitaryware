package com.example.sanitary.ware.backend.controllers;

import com.example.sanitary.ware.backend.entities.Stat;
import com.example.sanitary.ware.backend.services.StatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/stats")
@RequiredArgsConstructor
public class AdminStatController {

    private final StatService statService;

    @GetMapping
    public ResponseEntity<List<Stat>> getAllStats() {
        return ResponseEntity.ok(statService.getAllStats());
    }

    @PostMapping
    public ResponseEntity<Stat> createStat(@RequestBody Stat stat) {
        return ResponseEntity.ok(statService.createStat(stat));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Stat> updateStat(@PathVariable Long id, @RequestBody Stat stat) {
        return ResponseEntity.ok(statService.updateStat(id, stat));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStat(@PathVariable Long id) {
        statService.deleteStat(id);
        return ResponseEntity.noContent().build();
    }
}
