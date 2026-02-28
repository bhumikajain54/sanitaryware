package com.example.sanitary.ware.backend.dto.tally;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for Tally Sync Response
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TallySyncResponseDTO {

    private Boolean success;
    private String voucherNumber;
    private String masterId;
    private String errorMessage;
    private String tallyResponse;
}
