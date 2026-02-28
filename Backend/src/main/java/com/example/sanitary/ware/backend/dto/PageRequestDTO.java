package com.example.sanitary.ware.backend.dto;

import lombok.Data;

@Data
public class PageRequestDTO {
    private String title;
    private String slug;
    private String type;
    private String status;
    private String content;
    private String metaDescription;
    private boolean active;
}
