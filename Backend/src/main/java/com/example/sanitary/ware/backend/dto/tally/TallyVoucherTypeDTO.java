package com.example.sanitary.ware.backend.dto.tally;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TallyVoucherTypeDTO {
    private String name;
    private String parent;
    private String numberingMethod;
    private Boolean isDeemedPositive;
}
