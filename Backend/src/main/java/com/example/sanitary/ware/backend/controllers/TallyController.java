package com.example.sanitary.ware.backend.controllers;

import com.example.sanitary.ware.backend.dto.tally.*;
import com.example.sanitary.ware.backend.services.TallyIntegrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Public/User API for Tally integration operations
 * Base path: /api/tally
 */
@RestController
@RequestMapping("/api/tally")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class TallyController {

    private final TallyIntegrationService tallyService;

    /**
     * GET /api/tally/ledgers
     * Fetch all ledgers from Tally
     */
    @GetMapping("/ledgers")
    public ResponseEntity<?> getAllLedgers() {
        try {
            List<TallyLedgerDTO> ledgers = tallyService.getLedgersFromTally();
            return ResponseEntity.ok(ledgers);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "Tally server not available", "details", e.getMessage()));
        }
    }

    /**
     * POST /api/tally/ledger
     * Create a new ledger in Tally
     */
    @PostMapping("/ledger")
    public ResponseEntity<TallySyncResponseDTO> createLedger(@RequestBody TallyLedgerDTO ledgerDTO) {
        // Set default parent if not provided
        if (ledgerDTO.getParent() == null || ledgerDTO.getParent().isEmpty()) {
            ledgerDTO.setParent("Sundry Debtors");
        }
        TallySyncResponseDTO response = tallyService.syncLedger(ledgerDTO);
        if (response.getSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * POST /api/tally/voucher/sales
     * Create a sales voucher in Tally
     */
    @PostMapping("/voucher/sales")
    public ResponseEntity<TallySyncResponseDTO> createSalesVoucher(@RequestBody TallySalesVoucherDTO voucherDTO) {
        TallySyncResponseDTO response = tallyService.syncSalesVoucher(voucherDTO);
        if (response.getSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * GET /api/tally/stock-items
     * Fetch all stock items from Tally
     */
    @GetMapping("/stock-items")
    public ResponseEntity<?> getStockItems() {
        try {
            List<TallyProductDTO> stockItems = tallyService.getStockItemsFromTally();
            return ResponseEntity.ok(stockItems);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "Tally server not available", "details", e.getMessage()));
        }
    }

    /**
     * GET /api/tally/status
     * Check connection status
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        boolean connected = tallyService.testConnection();
        return ResponseEntity.ok(Map.of(
                "connected", connected,
                "status", connected ? "Synced successfully" : "Tally not connected"
        ));
    }
}
