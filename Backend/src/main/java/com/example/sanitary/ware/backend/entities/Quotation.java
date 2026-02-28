package com.example.sanitary.ware.backend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "quotations")
public class Quotation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "quotation_number", unique = true)
    private String quotationNumber;

    @Column(name = "customer_name")
    private String customerName;

    @Column(name = "customer_phone")
    private String customerPhone;

    @Column(name = "customer_email")
    private String customerEmail;

    // Address is optional for quick quotations
    @Column(name = "customer_address")
    private String customerAddress;

    @OneToMany(mappedBy = "quotation", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    private List<QuotationItem> items;

    @Column(name = "total_amount")
    private Double totalAmount;

    @Column
    private String status; // DRAFT, SENT, CONVERTED_TO_ORDER

    @Column(name = "reference_file")
    private String referenceFile; // Filename of imported PDF/Image/CSV

    @Column(name = "internal_notes", columnDefinition = "TEXT")
    private String internalNotes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "valid_until")
    private LocalDateTime validUntil;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        // Default validity: 7 days
        if (validUntil == null) {
            validUntil = createdAt.plusDays(7);
        }
    }
}
