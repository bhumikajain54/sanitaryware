package com.example.sanitary.ware.backend.controllers;

import com.example.sanitary.ware.backend.entities.CMSPage;
import com.example.sanitary.ware.backend.services.CMSPageService;
import com.example.sanitary.ware.backend.entities.Feature;
import com.example.sanitary.ware.backend.entities.Stat;
import com.example.sanitary.ware.backend.repositories.FeatureRepository;
import com.example.sanitary.ware.backend.repositories.StatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/content/pages")
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class ContentController {

    private final CMSPageService pageService;
    private final StatRepository statRepository;
    private final FeatureRepository featureRepository;

    @GetMapping("/stats")
    public ResponseEntity<List<Stat>> getStats() {
        return ResponseEntity.ok(statRepository.findAll());
    }

    @GetMapping("/features")
    public ResponseEntity<List<Feature>> getFeatures() {
        return ResponseEntity.ok(featureRepository.findAll());
    }

    @GetMapping
    public ResponseEntity<List<CMSPage>> getAllPages() {
        log.info("Fetching all pages");
        try {
            List<CMSPage> pages = pageService.getAllPages();
            log.info("Found {} pages", pages.size());
            return ResponseEntity.ok(pages);
        } catch (Exception e) {
            log.error("Error fetching pages", e);
            throw e;
        }
    }

    @GetMapping("/{slug}")
    public ResponseEntity<CMSPage> getPageBySlug(@PathVariable String slug) {
        try {
            return ResponseEntity.ok(pageService.getPageBySlug(slug));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
