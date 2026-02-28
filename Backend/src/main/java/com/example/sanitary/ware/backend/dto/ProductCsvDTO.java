package com.example.sanitary.ware.backend.dto;

import com.opencsv.bean.CsvBindByName;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for Product CSV Import/Export
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductCsvDTO {

    @CsvBindByName(column = "ID")
    private String id;

    @CsvBindByName(column = "Name")
    @NotBlank(message = "Product Name is required")
    private String name;

    @CsvBindByName(column = "Price")
    private String price;

    @CsvBindByName(column = "StockQuantity")
    private String stockQuantity;

    @CsvBindByName(column = "MainImage")
    private String mainImage;

    @CsvBindByName(column = "Category")
    private String category;

    @CsvBindByName(column = "Brand")
    private String brand;

    @CsvBindByName(column = "Active")
    private String active;

    @CsvBindByName(column = "Featured")
    private String featured;
}
