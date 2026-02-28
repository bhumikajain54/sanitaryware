package com.example.sanitary.ware.backend.dto.tally;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for receiving product/stock item data from Tally
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TallyProductDTO {

    private String name;
    private String alias;
    private String parent; // Category/Group
    private String baseUnits;
    private String hsnCode;
    private String gstApplicable;

    // Stock Information
    private Double closingBalance; // Current stock quantity
    private Double closingValue; // Current stock value
    private Double closingRate; // Current rate/price

    // Additional Details
    private String description;
    private String guid; // Tally's unique identifier

    // Opening Stock
    private Double openingBalance;
    private Double openingValue;
    private Double openingRate;
}
