package com.example.sanitary.ware.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TourDashboardDTO {
    private long totalDrafts;
    private long confirmedDrafts;
    private long pendingDrafts;
    private double totalDraftValue;
    private double confirmedValue;
}
