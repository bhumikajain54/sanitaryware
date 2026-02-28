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
@Table(name = "quotation_items")
public class QuotationItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quotation_id")
    @JsonIgnore
    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    private Quotation quotation;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    // Storing product details at the time of quotation in case prices change
    @Column(name = "product_name")
    private String productName;

    private Integer quantity;

    private Double originalPrice; // Original MRP/Price of the product

    private Double price; // Quoted Unit price (could be same as original or manual)

    private Double discount; // Optional discount per item (Flat amount)

    @Column(name = "discount_percentage")
    private Double discountPercentage; // Discount in %

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
