package com.example.sanitary.ware.backend.dto;

import com.opencsv.bean.CsvBindByName;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BannerCsvDTO {

    @CsvBindByName(column = "ImageUrl")
    @NotBlank(message = "ImageUrl is required")
    private String imageUrl;

    @CsvBindByName(column = "Title")
    private String title;

    @CsvBindByName(column = "Description")
    private String description;

    @CsvBindByName(column = "LinkUrl")
    private String linkUrl;

    @CsvBindByName(column = "Active")
    private Boolean active = true;
}
