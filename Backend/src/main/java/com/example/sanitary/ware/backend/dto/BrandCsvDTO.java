package com.example.sanitary.ware.backend.dto;

import com.opencsv.bean.CsvBindByName;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BrandCsvDTO {

    @CsvBindByName(column = "BrandName")
    @NotBlank(message = "BrandName is required")
    private String name;

    @CsvBindByName(column = "BrandCode")
    @NotBlank(message = "BrandCode is required")
    private String code;

    @CsvBindByName(column = "Description")
    private String description;

    @CsvBindByName(column = "Country")
    private String country;

    @CsvBindByName(column = "Status")
    private String status;
}
