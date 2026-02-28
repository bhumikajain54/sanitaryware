package com.example.sanitary.ware.backend.entities;

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
@Table(name = "cms_pages")
public class CMSPage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String slug;

    @Column(nullable = false)
    private String title;

    @Column(name = "content_type")
    private String type; // e.g., "Static Page"

    @Column(name = "publishing_status")
    private String status; // e.g., "Draft", "Published"

    @Column(columnDefinition = "TEXT")
    private String content;

    private String metaDescription;

    private boolean active;

    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
