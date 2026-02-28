package com.example.sanitary.ware.backend.entities;

import com.example.sanitary.ware.backend.enums.InvoiceStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "invoices")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String invoiceNumber;

    @OneToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(nullable = false)
    private LocalDate invoiceDate;

    private LocalDate dueDate;

    @Column(nullable = false)
    private Double subtotal;

    private Double taxAmount;

    private Double discountAmount;

    @Column(nullable = false)
    private Double totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private InvoiceStatus status;

    // Tally Integration Fields
    private String tallyVoucherNumber; // Tally's internal voucher number
    private String tallyMasterId; // Tally's GUID for this voucher
    private Boolean syncedToTally;
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private com.example.sanitary.ware.backend.enums.TallySyncStatus tallySyncStatus = com.example.sanitary.ware.backend.enums.TallySyncStatus.PENDING;
    private LocalDateTime lastSyncedAt;
    private String tallyErrorMessage;

    // GST/Tax Details
    private String gstNumber;
    private Double cgstAmount;
    private Double sgstAmount;
    private Double igstAmount;

    // Additional Details
    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(columnDefinition = "TEXT")
    private String termsAndConditions;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (syncedToTally == null) {
            syncedToTally = false;
        }
        if (tallySyncStatus == null) {
            tallySyncStatus = com.example.sanitary.ware.backend.enums.TallySyncStatus.PENDING;
        }
        if (status == null) {
            status = InvoiceStatus.DRAFT;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
