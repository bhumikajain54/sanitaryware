package com.example.sanitary.ware.backend.dto.tally;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating/updating Stock Items in Tally
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TallyStockItemDTO {

    private String name;
    private String alias;
    private String category;
    private String unit;
    private Double openingBalance;
    private Double openingRate;
    private String gstApplicable;
    private String hsnCode;
    private Double gstRate;
}
