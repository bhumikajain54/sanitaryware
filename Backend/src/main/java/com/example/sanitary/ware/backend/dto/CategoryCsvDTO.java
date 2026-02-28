package com.example.sanitary.ware.backend.dto;

import com.opencsv.bean.CsvBindByName;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for Category CSV Import/Export
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryCsvDTO {

    @CsvBindByName(column = "CategoryName")
    @NotBlank(message = "CategoryName is required")
    private String name;

    @CsvBindByName(column = "Description")
    private String description;

    @CsvBindByName(column = "Image")
    private String image;
}
