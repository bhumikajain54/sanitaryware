package com.example.sanitary.ware.backend.controllers;

import com.example.sanitary.ware.backend.dto.tally.TallySyncResponseDTO;
import com.example.sanitary.ware.backend.entities.Address;
import com.example.sanitary.ware.backend.entities.Product;
import com.example.sanitary.ware.backend.entities.User;
import com.example.sanitary.ware.backend.repositories.AddressRepository;
import com.example.sanitary.ware.backend.repositories.UserRepository;
import com.example.sanitary.ware.backend.services.BillingService;
import com.example.sanitary.ware.backend.services.ProductService;
import com.example.sanitary.ware.backend.services.TallyIntegrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Admin controller for Tally integration management
 */
@RestController
@RequestMapping("/api/admin/tally")
@RequiredArgsConstructor
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
        boolean connected = tallyIntegrationService.testConnection();
        return ResponseEntity.ok(Map.of(
                "connected", connected,
                "message", connected ? "Successfully connected to Tally" : "Failed to connect to Tally"));
    }

    /**
     * Sync product to Tally as Stock Item
     */
    @PostMapping("/sync-product/{productId}")
    public ResponseEntity<TallySyncResponseDTO> syncProduct(@PathVariable Long productId) {
        Product product = productService.getProductById(productId);
        TallySyncResponseDTO response = billingService.syncProductToTally(product);
        return ResponseEntity.ok(response);
    }

    /**
     * Sync customer to Tally as Ledger
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
     * Sync all products to Tally
     */
    @PostMapping("/sync-all-products")
    public ResponseEntity<Map<String, Object>> syncAllProducts() {
        var products = productService.getAllProducts("", null, null, null, null, 0, 10000).getContent();

        int successCount = 0;
        int failedCount = 0;

        for (Product product : products) {
            try {
                TallySyncResponseDTO response = billingService.syncProductToTally(product);
                if (response.getSuccess()) {
                    successCount++;
                } else {
                    failedCount++;
                }
            } catch (Exception e) {
                failedCount++;
            }
        }

        return ResponseEntity.ok(Map.of(
                "total", products.size(),
                "success", successCount,
                "failed", failedCount));
    }

    /**
     * Get Tally sync status
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getTallyStatus() {
        boolean connected = tallyIntegrationService.testConnection();
        long unsyncedInvoices = billingService.getUnsyncedInvoices().size();

        return ResponseEntity.ok(Map.of(
                "connected", connected,
                "unsyncedInvoices", unsyncedInvoices,
                "message", connected ? "Tally is connected and ready" : "Tally is not connected"));
    }

    /**
     * Fetch all Ledgers from Tally
     */
    @GetMapping("/ledgers")
    public ResponseEntity<java.util.List<com.example.sanitary.ware.backend.dto.tally.TallyLedgerDTO>> getLedgers() {
        return ResponseEntity.ok(tallyIntegrationService.getLedgersFromTally());
    }

    /**
     * Create Purchase Voucher (Manual/Test)
     */
    @PostMapping("/purchase-voucher")
    public ResponseEntity<TallySyncResponseDTO> createPurchaseVoucher(
            @RequestBody com.example.sanitary.ware.backend.dto.tally.TallyPurchaseVoucherDTO voucher) {
        return ResponseEntity.ok(tallyIntegrationService.syncPurchaseVoucher(voucher));
    }

    /**
     * Sync stock items from Tally to local database
     */
    @PostMapping("/sync-stock")
    public ResponseEntity<Map<String, Object>> syncStock() {
        billingService.syncAllStockFromTally();
        return ResponseEntity.ok(Map.of("message", "Stock synchronization completed successfully"));
    }

    /**
     * Fetch all Voucher Types from Tally
     */
    @GetMapping("/voucher-types")
    public ResponseEntity<java.util.List<com.example.sanitary.ware.backend.dto.tally.TallyVoucherTypeDTO>> getVoucherTypes() {
        return ResponseEntity.ok(tallyIntegrationService.getVoucherTypesFromTally());
    }
}
