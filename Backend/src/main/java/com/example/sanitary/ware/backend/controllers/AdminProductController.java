package com.example.sanitary.ware.backend.controllers;

import com.example.sanitary.ware.backend.entities.Product;
import com.example.sanitary.ware.backend.services.ProductService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class AdminProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity
                .ok(productService.getAllProducts("", null, null, null, null, 0, Integer.MAX_VALUE).getContent());
    }

    @PostMapping("/import")
    public ResponseEntity<List<String>> importProducts(@RequestPart("file") MultipartFile file) throws Exception {
        log.info("📥 Received product import request for file: {}", file.getOriginalFilename());
        List<String> errors = productService.importProducts(file);
        return ResponseEntity.ok(errors);
    }

    @GetMapping("/export/csv")
    public void exportProducts(HttpServletResponse response) throws Exception {
        response.setContentType("text/csv; charset=UTF-8");
        response.setHeader("Content-Disposition", "attachment; filename=products.csv");
        productService.exportProducts(response.getWriter());
    }

    @GetMapping("/export/pdf")
    public void exportProductsPdf(HttpServletResponse response) throws Exception {
        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=products.pdf");
        productService.exportProductsToPdf(response);
    }

    @GetMapping("/bulk-update")
    public ResponseEntity<String> bulkStockUpdateGet(@RequestParam Integer quantity) {
        log.info("Bulk update GET request received for quantity: {}", quantity);
        int updatedCount = productService.updateAllStock(quantity);
        return ResponseEntity.ok("Successfully updated stock for " + updatedCount + " products to " + quantity);
    }

    @PostMapping("/bulk-update")
    public ResponseEntity<String> bulkStockUpdatePost(@RequestParam Integer quantity) {
        log.info("Bulk update POST request received for quantity: {}", quantity);
        int updatedCount = productService.updateAllStock(quantity);
        return ResponseEntity.ok("Successfully updated stock for " + updatedCount + " products to " + quantity);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody @NonNull Product product) {
        return ResponseEntity.ok(productService.createProduct(product));
    }

    @PutMapping("/{id:[0-9]+}")
    @PatchMapping("/{id:[0-9]+}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        return ResponseEntity.ok(productService.updateProduct(id, product));
    }

    @DeleteMapping("/{id:[0-9]+}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id:[0-9]+}/status")
    public ResponseEntity<Product> updateProductStatus(@PathVariable Long id, @RequestParam boolean active) {
        Product product = productService.getProductById(id);
        product.setActive(active);
        return ResponseEntity.ok(productService.updateProduct(id, product));
    }

    @GetMapping("/by-category/{categoryId}")
    public ResponseEntity<List<Product>> getProductsByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(productService.getProductsByCategory(categoryId));
    }

    @GetMapping("/by-brand/{brandId}")
    public ResponseEntity<List<Product>> getProductsByBrand(@PathVariable Long brandId) {
        return ResponseEntity.ok(productService.getProductsByBrand(brandId));
    }

    @PutMapping("/{id:[0-9]+}/stock")
    public ResponseEntity<Product> updateStock(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Integer> payload,
            @RequestParam(required = false) Integer quantity) {

        Integer finalQuantity = quantity;

        if (finalQuantity == null && payload != null) {
            finalQuantity = payload.get("quantity");
            if (finalQuantity == null)
                finalQuantity = payload.get("stockQuantity");
            if (finalQuantity == null)
                finalQuantity = payload.get("stock");
        }

        if (finalQuantity == null) {
            log.warn("⚠️ Stock update called for ID: {} with no quantity provided", id);
            return ResponseEntity.badRequest().build();
        }

        log.info("Received stock update for ID: {}. Quantity: {}", id, finalQuantity);
        return ResponseEntity.ok(productService.updateStock(id, finalQuantity));
    }

    /**
     * Bulk delete — supports DELETE (frontend) and POST (fallback).
     *
     * IDs are resolved in priority order:
     * 1. JSON body: { "ids": [1, 2, 3] }
     * 2. Query param: ?ids=1,2,3 (fallback when client strips DELETE body)
     * 3. Neither: graceful 204 no-op
     *
     * Uses try/catch to return a meaningful error instead of 500.
     */
    @DeleteMapping("/bulk-delete")
    @PostMapping("/bulk-delete")
    public ResponseEntity<?> bulkDeleteProducts(
            @RequestBody(required = false) Map<String, List<Long>> payload,
            @RequestParam(required = false) List<Long> ids) {

        try {
            List<Long> targetIds = null;

            // 1. Try to get IDs from JSON body
            if (payload != null && payload.containsKey("ids")) {
                targetIds = payload.get("ids");
            }

            // 2. Fallback to query parameters if body missing/empty
            if ((targetIds == null || targetIds.isEmpty()) && ids != null && !ids.isEmpty()) {
                targetIds = ids;
            }

            if (targetIds == null || targetIds.isEmpty()) {
                log.warn("⚠️ Bulk delete called with empty IDs list");
                return ResponseEntity.badRequest().body(Map.of("error", "No product IDs provided for deletion"));
            }

            log.info("🗑️ Deleting {} products with IDs: {}", targetIds.size(), targetIds);
            productService.bulkDeleteProducts(targetIds);
            log.info("✅ Bulk delete successful for {} products", targetIds.size());

            return ResponseEntity.ok(Map.of("message", "Products deleted successfully"));

        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            log.error("❌ Foreign key constraint failed during bulk delete", e);
            return ResponseEntity.status(409).body(Map.of(
                    "error", "Cannot delete. Products are referenced in existing orders.",
                    "details", e.getMessage()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("❌ Bulk delete failed", e);
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Internal Server Error",
                    "details", e.getMessage() != null ? e.getMessage() : "Unknown error"
            ));
        }
    }

    @PostMapping("/stock-alert")
    public ResponseEntity<Void> sendStockAlert(@RequestBody Map<String, Object> payload) {
        log.info("🚨 STOCK ALERT: Out of stock - {}", payload.get("name"));
        return ResponseEntity.ok().build();
    }

}