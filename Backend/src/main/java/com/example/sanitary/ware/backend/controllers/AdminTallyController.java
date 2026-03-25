package com.example.sanitary.ware.backend.controllers;

import com.example.sanitary.ware.backend.dto.tally.*;
import com.example.sanitary.ware.backend.entities.Address;
import com.example.sanitary.ware.backend.entities.Product;
import com.example.sanitary.ware.backend.entities.User;
import com.example.sanitary.ware.backend.repositories.AddressRepository;
import com.example.sanitary.ware.backend.repositories.UserRepository;
import com.example.sanitary.ware.backend.services.BillingService;
import com.example.sanitary.ware.backend.services.ProductService;
import com.example.sanitary.ware.backend.services.TallyIntegrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Admin controller for Tally integration management
 */
@RestController
@RequestMapping("/api/admin/tally")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
@Slf4j
public class AdminTallyController {

    private final TallyIntegrationService tallyIntegrationService;
    private final BillingService billingService;
    private final ProductService productService;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;

    /**
     * Test Tally connection
     */
    @GetMapping("/test-connection")
    public ResponseEntity<Map<String, Object>> testConnection() {
        log.info("Testing Tally connection...");
        boolean connected = tallyIntegrationService.testConnection();
        return ResponseEntity.ok(Map.of(
                "connected", connected,
                "message", connected ? "Successfully connected to Tally" : "Failed to connect to Tally"));
    }

    /**
     * Get Tally sync status
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getTallyStatus() {
        log.debug("Fetching Tally status...");
        boolean connected = tallyIntegrationService.testConnection();
        long unsyncedInvoices = billingService.getUnsyncedInvoices().size();

        return ResponseEntity.ok(Map.of(
                "connected", connected,
                "unsyncedInvoices", unsyncedInvoices,
                "message", connected ? "Synced successfully" : "Tally not connected"));
    }

    /**
     * Fetch all Ledgers from Tally
     */
    @GetMapping("/ledgers")
    public ResponseEntity<List<TallyLedgerDTO>> getLedgers() {
        return ResponseEntity.ok(tallyIntegrationService.getLedgersFromTally());
    }

    /**
     * Fetch all stock items from Tally
     */
    @GetMapping("/stock-items")
    public ResponseEntity<List<TallyProductDTO>> getStockItems() {
        return ResponseEntity.ok(tallyIntegrationService.getStockItemsFromTally());
    }

    /**
     * Create a new ledger in Tally
     */
    @PostMapping("/ledger")
    public ResponseEntity<TallySyncResponseDTO> createLedger(@RequestBody TallyLedgerDTO ledgerDTO) {
        if (ledgerDTO.getParent() == null || ledgerDTO.getParent().isEmpty()) {
            ledgerDTO.setParent("Sundry Debtors");
        }
        return ResponseEntity.ok(tallyIntegrationService.syncLedger(ledgerDTO));
    }

    /**
     * Create a sales voucher in Tally (direct entry)
     */
    @PostMapping("/voucher/sales")
    public ResponseEntity<TallySyncResponseDTO> createSalesVoucher(@RequestBody TallySalesVoucherDTO voucherDTO) {
        return ResponseEntity.ok(tallyIntegrationService.syncSalesVoucher(voucherDTO));
    }

    /**
     * Sync single product to Tally
     */
    @PostMapping("/sync-product/{productId}")
    public ResponseEntity<TallySyncResponseDTO> syncProduct(@PathVariable Long productId) {
        Product product = productService.getProductById(productId);
        TallySyncResponseDTO response = billingService.syncProductToTally(product);
        return ResponseEntity.ok(response);
    }

    /**
     * Sync single customer to Tally
     */
    @PostMapping("/sync-customer/{customerId}")
    public ResponseEntity<TallySyncResponseDTO> syncCustomer(
            @PathVariable Long customerId,
            @RequestParam(required = false) Long addressId) {

        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found: " + customerId));

        Address address = null;
        if (addressId != null) {
            address = addressRepository.findById(addressId).orElse(null);
        }

        TallySyncResponseDTO response = billingService.syncCustomerToTally(customer, address);
        return ResponseEntity.ok(response);
    }

    /**
     * Sync stock counts from Tally to local database
     */
    @PostMapping("/sync-stock")
    public ResponseEntity<Map<String, Object>> syncStock() {
        billingService.syncAllStockFromTally();
        return ResponseEntity.ok(Map.of("message", "Stock synchronization completed successfully"));
    }
}
