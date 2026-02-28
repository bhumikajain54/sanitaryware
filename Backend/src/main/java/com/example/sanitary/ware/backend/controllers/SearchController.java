package com.example.sanitary.ware.backend.controllers;

import com.example.sanitary.ware.backend.entities.Product;
import com.example.sanitary.ware.backend.services.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> globalSearch(@RequestParam String q) {
        Map<String, Object> results = new HashMap<>();

        // Search products
        List<Product> products = productService.searchProductsByName(q);
        results.put("products", products);

        // We can add categories/brands search here if needed
        // results.put("categories", categoryService.searchCategories(q));

        results.put("query", q);
        results.put("totalResults", products.size());

        return ResponseEntity.ok(results);
    }
}
