package com.example.sanitary.ware.backend.dto.tally;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating/updating Ledgers (Customers) in Tally
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TallyLedgerDTO {

    private String name;
    private String alias;
    private String parent; // e.g., "Sundry Debtors"
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String country;
    private String phone;
    private String email;
    private String gstin;
    private String pan;
    private Double openingBalance;
    private Boolean isDebit;
    private String guid;
    private String tallyReference;
}
