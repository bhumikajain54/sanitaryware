package com.example.sanitary.ware.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerPreferenceDTO {
    private boolean emailNotifications;
    private boolean smsNotifications;
    private boolean orderUpdates;
    private boolean promotionalEmails;
    private boolean newsletter;
    private boolean twoFactorEnabled;
    private String language;
    private String currency;
}
