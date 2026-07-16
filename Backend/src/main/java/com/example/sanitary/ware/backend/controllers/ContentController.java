package com.example.sanitary.ware.backend.controllers;

import com.example.sanitary.ware.backend.entities.CMSPage;
import com.example.sanitary.ware.backend.services.CMSPageService;
import com.example.sanitary.ware.backend.entities.Feature;
import com.example.sanitary.ware.backend.entities.Stat;
import com.example.sanitary.ware.backend.repositories.FeatureRepository;
import com.example.sanitary.ware.backend.repositories.StatRepository;
import com.example.sanitary.ware.backend.repositories.BannerRepository;
import com.example.sanitary.ware.backend.repositories.CategoryRepository;
import com.example.sanitary.ware.backend.repositories.BrandRepository;
import com.example.sanitary.ware.backend.repositories.ProductRepository;
import com.example.sanitary.ware.backend.repositories.ReviewRepository;
import com.example.sanitary.ware.backend.entities.User;
import com.example.sanitary.ware.backend.entities.Product;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/content/pages")
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class ContentController {

    private final CMSPageService pageService;
    private final StatRepository statRepository;
    private final FeatureRepository featureRepository;
    private final BannerRepository bannerRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;

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

    @GetMapping("/landing")
    public ResponseEntity<Map<String, Object>> getLandingData() {
        Map<String, Object> data = new HashMap<>();

        try {
            data.put("banners", bannerRepository.findAll());
        } catch (Exception e) {
            data.put("banners", List.of());
        }

        try {
            data.put("categories", categoryRepository.findAll());
        } catch (Exception e) {
            data.put("categories", List.of());
        }

        try {
            data.put("brands", brandRepository.findAll());
        } catch (Exception e) {
            data.put("brands", List.of());
        }
        try {
            List<Map<String, Object>> testimonials = reviewRepository.findAll().stream()
                .map(review -> {
                    Map<String, Object> t = new HashMap<>();
                    t.put("id", review.getId());
                    t.put("rating", review.getRating());
                    t.put("comment", review.getComment());
                    
                    User user = review.getUser();
                    if (user != null) {
                        t.put("name", (user.getFirstName() + " " + user.getLastName()).trim());
                    } else {
                        t.put("name", "Verified Customer");
                    }
                    
                    Product product = review.getProduct();
                    if (product != null) {
                        t.put("role", "Reviewed: " + product.getName());
                    } else {
                        t.put("role", "Verified Purchase");
                    }
                    return t;
                })
                .toList();
            data.put("testimonials", testimonials);
        } catch (Exception e) {
            data.put("testimonials", List.of());
        }

        try {
            // Get first 4 products sorted by createdAt desc
            data.put("products", productRepository.findAll(PageRequest.of(0, 4, Sort.by(Sort.Direction.DESC, "createdAt"))).getContent());
        } catch (Exception e) {
            try {
                data.put("products", productRepository.findAll(PageRequest.of(0, 4)).getContent());
            } catch (Exception ex) {
                data.put("products", List.of());
            }
        }

        try {
            data.put("stats", statRepository.findAll());
        } catch (Exception e) {
            data.put("stats", List.of());
        }

        try {
            data.put("features", featureRepository.findAll());
        } catch (Exception e) {
            data.put("features", List.of());
        }

        CMSPage aboutPage = null;
        try {
            aboutPage = pageService.getPageBySlug("about-us");
        } catch (Exception e) {
            try {
                aboutPage = pageService.getPageBySlug("about");
            } catch (Exception ex) {
                // ignore
            }
        }
        data.put("aboutPage", aboutPage);

        return ResponseEntity.ok(data);
    }
}
