package com.example.sanitary.ware.backend.enums;

public enum InvoiceStatus {
    DRAFT, // Invoice created but not finalized
    GENERATED, // Invoice finalized and ready
    SENT, // Invoice sent to customer
    PAID, // Payment received
    PARTIALLY_PAID, // Partial payment received
    OVERDUE, // Payment overdue
    CANCELLED, // Invoice cancelled
    REFUNDED // Invoice refunded
}
