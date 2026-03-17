package com.example.sanitary.ware.backend.controllers;

import com.example.sanitary.ware.backend.entities.Brand;
import com.example.sanitary.ware.backend.services.BrandService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin/brands")
@RequiredArgsConstructor
public class AdminBrandController {

    private final BrandService brandService;

    @GetMapping
    public ResponseEntity<List<Brand>> getAllBrands() {
        return ResponseEntity.ok(brandService.getAllBrands());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Brand> getBrandById(@PathVariable Long id) {
        Brand brand = brandService.getBrandById(id);
        return ResponseEntity.ok(brand);
    }

    @PostMapping("/import")
    public ResponseEntity<List<String>> importBrands(@RequestPart("file") MultipartFile file) throws Exception {
        List<String> errors = brandService.importBrands(file);
        return ResponseEntity.ok(errors);
    }

    @GetMapping("/export")
    public void exportBrands(HttpServletResponse response) throws Exception {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=brands.csv");
        brandService.exportBrands(response.getWriter());
    }

    @GetMapping("/export/pdf")
    public void exportBrandsPdf(HttpServletResponse response) throws Exception {
        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=brands.pdf");
        brandService.exportBrandsToPdf(response);
    }

    @PostMapping
    public ResponseEntity<Brand> createBrand(@RequestBody @NonNull Brand brand) {
        return ResponseEntity.ok(brandService.createBrand(brand));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Brand> updateBrand(@PathVariable Long id, @RequestBody Brand brand) {
        return ResponseEntity.ok(brandService.updateBrand(id, brand));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBrand(@PathVariable Long id) {
        brandService.deleteBrand(id);
        return ResponseEntity.noContent().build();
    }
}
