package com.example.sanitary.ware.backend.entities;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "products")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "main_image", columnDefinition = "TEXT")
    private String mainImage;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String features;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "brand_id")
    private Brand brand;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    @JsonProperty("brand")
    public void setBrand(Object value) {
        if (value instanceof String) {
            this.brand = Brand.builder().name((String) value).build();
        } else if (value instanceof Integer || value instanceof Long) {
            this.brand = Brand.builder().id(Long.valueOf(value.toString())).build();
        } else if (value instanceof java.util.Map) {
            java.util.Map<?, ?> map = (java.util.Map<?, ?>) value;
            Brand b = new Brand();
            if (map.containsKey("id") && map.get("id") != null) b.setId(Long.valueOf(map.get("id").toString()));
            if (map.containsKey("name")) b.setName((String) map.get("name"));
            this.brand = b;
        }
    }

    @JsonProperty("category")
    public void setCategory(Object value) {
        if (value instanceof String) {
            this.category = Category.builder().name((String) value).build();
        } else if (value instanceof Integer || value instanceof Long) {
            this.category = Category.builder().id(Long.valueOf(value.toString())).build();
        } else if (value instanceof java.util.Map) {
            java.util.Map<?, ?> map = (java.util.Map<?, ?>) value;
            Category c = new Category();
            if (map.containsKey("id") && map.get("id") != null) c.setId(Long.valueOf(map.get("id").toString()));
            if (map.containsKey("name")) c.setName((String) map.get("name"));
            this.category = c;
        }
    }

    @Builder.Default
    @Column(nullable = false)
    private Double price = 0.0;

    @JsonProperty("stockQuantity")
    @JsonAlias({ "stock", "quantity" })
    @Column(name = "stock_quantity")
    private Integer stockQuantity;

    @Builder.Default
    private Boolean active = true;

    @Builder.Default
    private Boolean featured = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
