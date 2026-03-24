package com.example.sanitary.ware.backend.scheduling;

import com.example.sanitary.ware.backend.config.TallyProperties;
import com.example.sanitary.ware.backend.entities.Invoice;
import com.example.sanitary.ware.backend.services.BillingService;
import com.example.sanitary.ware.backend.services.TallyIntegrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Scheduler for automatic Tally synchronization
 */
@Slf4j
@Component
@Configuration
@EnableScheduling
@RequiredArgsConstructor
public class TallyScheduler {

    private final TallyIntegrationService tallyService;
    private final BillingService billingService;
    private final TallyProperties tallyProperties;

    /**
     * Auto-sync unsynced invoices every minute
     */
    @Scheduled(fixedRate = 60000)
    public void autoSyncInvoices() {
        if (!tallyProperties.isEnabled()) {
            return;
        }

        log.debug("Starting automatic Tally sync for invoices...");
        
        try {
            // Check connection first
            if (!tallyService.testConnection()) {
                log.warn("Tally server not reachable, skipping auto-sync.");
                return;
            }

            // Get all pending invoices
            List<Invoice> unsyncedInvoices = billingService.getUnsyncedInvoices();
            
            if (unsyncedInvoices.isEmpty()) {
                return;
            }

            log.info("Found {} unsynced invoices for Tally. Processing...", unsyncedInvoices.size());

            int successCount = 0;
            for (Invoice invoice : unsyncedInvoices) {
                try {
                    Invoice syncedInvoce = billingService.syncInvoiceToTally(invoice.getId());
                    if (syncedInvoce.getSyncedToTally()) {
                        successCount++;
                    }
                } catch (Exception e) {
                    log.error("Failed to sync invoice {} during scheduled task: {}", invoice.getInvoiceNumber(), e.getMessage());
                }
            }

            if (successCount > 0) {
                log.info("Successfully auto-synced {} orders to Tally", successCount);
            }
            
        } catch (Exception e) {
            log.error("Error in Tally auto-sync scheduler: {}", e.getMessage(), e);
        }
    }
}
