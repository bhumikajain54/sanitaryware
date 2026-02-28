package com.example.sanitary.ware.backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "order_draft_items")
public class OrderDraftItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_draft_id")
    @JsonIgnore
    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    private OrderDraft orderDraft;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(name = "product_name")
    private String productName;

    private Integer quantity;

    private Double originalPrice; // MRP at time of drafting

    private Double price; // Quoted/Negotiated price

    private Double discount; // Flat discount

    private Double discountPercentage; // Discount %

    public Double getTotal() {
        if (price == null || quantity == null)
            return 0.0;
        double baseTotal = price * quantity;
        double discountAmount = 0.0;

        if (discountPercentage != null && discountPercentage > 0) {
            discountAmount = baseTotal * (discountPercentage / 100);
        } else if (discount != null) {
            discountAmount = discount;
        }

        return baseTotal - discountAmount;
    }
}
