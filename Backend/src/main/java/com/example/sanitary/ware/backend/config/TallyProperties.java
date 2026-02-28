package com.example.sanitary.ware.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "tally")
public class TallyProperties {

    private boolean enabled = false;
    private String host = "localhost";
    private int port = 9000;
    private String companyName;
    private int connectionTimeout = 30000; // 30 seconds
    private int requestTimeout = 60000; // 60 seconds

    // Ledger Configuration
    private String salesLedger = "Sales";
    private String cashLedger = "Cash";
    private String bankLedger = "Bank Account";
    private String debtorsLedger = "Sundry Debtors";

    // GST Configuration
    private String cgstLedger = "CGST";
    private String sgstLedger = "SGST";
    private String igstLedger = "IGST";

    // Voucher Types
    private String salesVoucherType = "Sales";
    private String receiptVoucherType = "Receipt";

    public String getBaseUrl() {
        return String.format("http://%s:%d", host, port);
    }
}
