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
    public ResponseEntity<List<String>> importProducts(@RequestParam("file") MultipartFile file) throws Exception {
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
        @SuppressWarnings("null")
        Product product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody @NonNull Product product) {
        return ResponseEntity.ok(productService.createProduct(product));
    }

    @PutMapping("/{id}")
    @PatchMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        return ResponseEntity.ok(productService.updateProduct(id, product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        @SuppressWarnings("null")
        Long productId = id;
        productService.deleteProduct(productId); // Warning likely in service call
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Product> updateProductStatus(@PathVariable Long id, @RequestParam boolean active) {
        @SuppressWarnings("null")
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

    @PutMapping("/{id}/stock")
    public ResponseEntity<Product> updateStock(@PathVariable Long id,
            @RequestBody(required = false) java.util.Map<String, Integer> payload,
            @RequestParam(required = false) Integer quantity) {
        Integer finalQuantity = quantity;
        if (finalQuantity == null && payload != null) {
            finalQuantity = payload.get("quantity");
            if (finalQuantity == null) {
                finalQuantity = payload.get("stockQuantity");
            }
            if (finalQuantity == null) {
                finalQuantity = payload.get("stock");
            }
        }
        log.info("Received stock update for ID: {}. Quantity: {}", id, finalQuantity);
        return ResponseEntity.ok(productService.updateStock(id, finalQuantity));
    }

}
