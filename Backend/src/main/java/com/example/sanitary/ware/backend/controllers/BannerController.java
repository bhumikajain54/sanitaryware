package com.example.sanitary.ware.backend.controllers;

import com.example.sanitary.ware.backend.dto.BannerRequestDTO;
import com.example.sanitary.ware.backend.entities.Banner;
import com.example.sanitary.ware.backend.services.BannerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/banners")
@RequiredArgsConstructor
public class BannerController {

    private final BannerService bannerService;

    // Public endpoint for landing page
    @GetMapping
    public ResponseEntity<List<Banner>> getActiveBanners() {
        return ResponseEntity.ok(bannerService.getActiveBanners());
    }

    // Admin endpoints (The frontend seems to call /api/banners/admin)
    @GetMapping("/admin")
    public ResponseEntity<List<Banner>> getAllBannersForAdmin() {
        return ResponseEntity.ok(bannerService.getAllBanners());
    }

    @PostMapping("/admin")
    public ResponseEntity<Banner> createBanner(@Valid @RequestBody BannerRequestDTO banner) {
        return ResponseEntity.ok(bannerService.createBanner(banner));
    }

    @PostMapping("/admin/import")
    public ResponseEntity<java.util.List<String>> importBanners(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) throws Exception {
        return ResponseEntity.ok(bannerService.importBanners(file));
    }

    @PutMapping("/admin/{id}")
    public ResponseEntity<Banner> updateBanner(@PathVariable Long id, @Valid @RequestBody BannerRequestDTO banner) {
        return ResponseEntity.ok(bannerService.updateBanner(id, banner));
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<Void> deleteBanner(@PathVariable Long id) {
        bannerService.deleteBanner(id);
        return ResponseEntity.noContent().build();
    }
}
