package com.example.sanitary.ware.backend.dto.tally;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO for creating Sales Voucher in Tally
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TallySalesVoucherDTO {

    private String voucherNumber;
    private LocalDate date;
    private String partyName;
    private String partyAddress;
    private String partyGstin;
    private String narration;

    private List<TallyInventoryEntry> inventoryEntries;
    private List<TallyLedgerEntry> ledgerEntries;

    private Double totalAmount;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TallyInventoryEntry {
        private String itemName;
        private Integer quantity;
        private String unit;
        private Double rate;
        private Double amount;
        private Double discountPercent;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TallyLedgerEntry {
        private String ledgerName;
        private Double amount;
        private Boolean isDebit;
    }
}
