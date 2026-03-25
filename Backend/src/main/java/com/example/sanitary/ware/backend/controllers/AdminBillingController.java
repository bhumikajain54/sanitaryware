package com.example.sanitary.ware.backend.controllers;

import com.example.sanitary.ware.backend.entities.Invoice;
import com.example.sanitary.ware.backend.enums.InvoiceStatus;
import com.example.sanitary.ware.backend.services.BillingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Admin controller for billing and invoice management
 */
@RestController
@RequestMapping("/api/admin/billing")
@CrossOrigin(origins = "*", allowedHeaders = "*")
@RequiredArgsConstructor
public class AdminBillingController {

    private final BillingService billingService;
    private final com.example.sanitary.ware.backend.services.TallyIntegrationService tallyIntegrationService;
    private final com.example.sanitary.ware.backend.services.OrderService orderService;

    /**
     * Generate invoice for an order
     */
    @PostMapping("/generate/{orderId}")
    public ResponseEntity<Invoice> generateInvoice(@PathVariable Long orderId) {
        Invoice invoice = billingService.generateInvoice(orderId);
        // Automatically send notification
        try {
            billingService.getWhatsAppService().sendInvoiceConfirmation(invoice);
        } catch (Exception ignore) {
        }
        return ResponseEntity.ok(invoice);
    }

    /**
     * Get all invoices
     */
    @GetMapping("/invoices")
    public ResponseEntity<List<Invoice>> getAllInvoices() {
        return ResponseEntity.ok(billingService.getAllInvoices());
    }

    /**
     * Get invoice by ID
     */
    @GetMapping("/invoices/{id}")
    public ResponseEntity<Invoice> getInvoiceById(@PathVariable Long id) {
        return ResponseEntity.ok(billingService.getInvoiceById(id));
    }

    /**
     * Get invoice by order ID
     */
    @GetMapping("/invoices/order/{orderId}")
    public ResponseEntity<Invoice> getInvoiceByOrder(@PathVariable Long orderId) {
        return billingService.getInvoiceByOrder(orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get unsynced invoices
     */
    @GetMapping("/invoices/unsynced")
    public ResponseEntity<List<Invoice>> getUnsyncedInvoices() {
        return ResponseEntity.ok(billingService.getUnsyncedInvoices());
    }

    /**
     * Update invoice status
     */
    @PatchMapping("/invoices/{id}/status")
    public ResponseEntity<Invoice> updateInvoiceStatus(
            @PathVariable Long id,
            @RequestParam InvoiceStatus status) {
        Invoice invoice = billingService.updateInvoiceStatus(id, status);
        return ResponseEntity.ok(invoice);
    }

    /**
     * Sync invoice to Tally
     */
    @PostMapping("/invoices/{id}/sync-tally")
    public ResponseEntity<Invoice> syncInvoiceToTally(@PathVariable Long id) {
        Invoice invoice = billingService.syncInvoiceToTally(id);
        return ResponseEntity.ok(invoice);
    }

    /**
     * Bulk sync all unsynced invoices to Tally
     */
    @PostMapping("/invoices/sync-all")
    public ResponseEntity<Map<String, Object>> syncAllInvoices() {
        List<Invoice> syncedInvoices = billingService.syncAllUnsyncedInvoices();

        long successCount = syncedInvoices.stream()
                .filter(Invoice::getSyncedToTally)
                .count();

        long failedCount = syncedInvoices.size() - successCount;

        return ResponseEntity.ok(Map.of(
                "total", syncedInvoices.size(),
                "success", successCount,
                "failed", failedCount,
                "invoices", syncedInvoices));
    }

    /**
     * Fetch all products/stock items from Tally
     */
    @GetMapping("/tally/products")
    public ResponseEntity<List<com.example.sanitary.ware.backend.dto.tally.TallyProductDTO>> getTallyProducts() {
        List<com.example.sanitary.ware.backend.dto.tally.TallyProductDTO> products = tallyIntegrationService
                .getStockItemsFromTally();
        return ResponseEntity.ok(products);
    }

    /**
     * Manually sync an order to Tally
     */
    @PostMapping("/orders/{orderId}/sync-tally")
    public ResponseEntity<com.example.sanitary.ware.backend.dto.tally.TallySyncResponseDTO> syncOrderToTally(
            @PathVariable Long orderId) {
        // Get order from order service
        com.example.sanitary.ware.backend.entities.Order order = orderService.getOrderById(orderId);

        com.example.sanitary.ware.backend.dto.tally.TallySyncResponseDTO response = tallyIntegrationService
                .syncOrderToTally(order);
        return ResponseEntity.ok(response);
    }

    /**
     * Test Tally connection
     */
    @GetMapping("/tally/test-connection")
    public ResponseEntity<Map<String, Object>> testTallyConnection() {
        boolean connected = tallyIntegrationService.testConnection();
        return ResponseEntity.ok(Map.of(
                "connected", connected,
                "message", connected ? "Successfully connected to Tally" : "Failed to connect to Tally"));
    }

    /**
     * Send invoice via WhatsApp
     */
    @PostMapping("/invoices/{id}/send-whatsapp")
    public ResponseEntity<Void> sendWhatsApp(@PathVariable Long id) {
        Invoice invoice = billingService.getInvoiceById(id);
        billingService.getWhatsAppService().sendInvoiceConfirmation(invoice);
        return ResponseEntity.ok().build();
    }
}
