package com.example.sanitary.ware.backend.controllers;

import com.example.sanitary.ware.backend.dto.PageRequestDTO;
import com.example.sanitary.ware.backend.entities.CMSPage;
import com.example.sanitary.ware.backend.services.CMSPageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/content/pages")
@RequiredArgsConstructor
public class AdminContentController {

    private final CMSPageService pageService;

    @GetMapping
    public ResponseEntity<List<CMSPage>> getAllPages() {
        return ResponseEntity.ok(pageService.getAllPages());
    }

    @PostMapping
    public ResponseEntity<CMSPage> createPage(@RequestBody PageRequestDTO dto) {
        return ResponseEntity.ok(pageService.createPage(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CMSPage> updatePage(@PathVariable Long id, @RequestBody PageRequestDTO dto) {
        return ResponseEntity.ok(pageService.updatePage(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePage(@PathVariable Long id) {
        pageService.deletePage(id);
        return ResponseEntity.noContent().build();
    }
}
