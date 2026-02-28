package com.example.sanitary.ware.backend.controllers;

import com.example.sanitary.ware.backend.entities.CMSPage;
import com.example.sanitary.ware.backend.services.CMSPageService;
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
