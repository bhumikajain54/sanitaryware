package com.example.sanitary.ware.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponseDTO {
    private Long id;
    private String name;
    private Double price;
    private Integer stockQuantity;
    private String mainImage;
    private String description;
    private String features;
    private Boolean active;
    private Boolean featured;

    // Lightweight category and brand info
    private Long categoryId;
    private String categoryName;
    private Long brandId;
    private String brandName;
}
