package com.example.sanitary.ware.backend.services;

import com.example.sanitary.ware.backend.dto.tally.*;
import com.example.sanitary.ware.backend.entities.*;
import com.example.sanitary.ware.backend.enums.InvoiceStatus;
import com.example.sanitary.ware.backend.enums.TallySyncStatus;
import com.example.sanitary.ware.backend.repositories.InvoiceRepository;
import com.example.sanitary.ware.backend.repositories.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Service for Invoice/Billing operations and Tally synchronization
 */
@Slf4j
@Service
@RequiredArgsConstructor
@lombok.Getter
public class BillingService {

    private final InvoiceRepository invoiceRepository;
    private final OrderRepository orderRepository;
    private final com.example.sanitary.ware.backend.repositories.ProductRepository productRepository;
    private final TallyIntegrationService tallyIntegrationService;
    private final WhatsAppService whatsAppService;

    /**
     * /**
     * Generate invoice for an order
     */
    @Transactional
    public Invoice generateInvoice(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        // 1. Check if invoice already exists
        Optional<Invoice> existingInvoice = invoiceRepository.findByOrder(order);
        if (existingInvoice.isPresent()) {
            // Check if order total has changed (e.g. edited order)
            Invoice existing = existingInvoice.get();
            if (Math.abs(existing.getTotalAmount() - order.getTotalAmount()) < 0.01) {
                log.info("Returning existing match invoice for order: {}", orderId);
                return existing;
            } else {
                log.warn("Invoice amount mismatch! Regenerating invoice for order: {}", orderId);
                // In a real system, you might archive the old invoice here.
                // For now, we update the existing one.
                return updateExistingInvoice(existing, order);
            }
        }

        return createNewInvoice(order);
    }

    private Invoice createNewInvoice(Order order) {
        // 2. Identify Amounts (Assuming Order Total is Tax Inclusive)
        Double finalOrderTotal = order.getTotalAmount();
        Double taxRate = 0.18; // 18% GST default

        // Back-calculate Tax (Tax Inclusive Logic: Total = Base + Tax)
        // Base * 1.18 = Total => Base = Total / 1.18
        Double baseAmount = finalOrderTotal / (1.0 + taxRate);
        Double taxAmount = finalOrderTotal - baseAmount;

        // Rounding to 2 decimal places
        baseAmount = Math.round(baseAmount * 100.0) / 100.0;
        taxAmount = Math.round(taxAmount * 100.0) / 100.0;

        // 4. Determine IGST vs CGST/SGST
        String warehouseState = "Maharashtra"; // Replace with your actual Warehouse State or config
        String customerState = (order.getShippingAddress() != null) ? order.getShippingAddress().getState()
                : "Maharashtra";

        Double cgst = 0.0, sgst = 0.0, igst = 0.0;

        // Simple State Normalization for comparison
        if (customerState != null && customerState.trim().equalsIgnoreCase(warehouseState)) {
            cgst = taxAmount / 2;
            sgst = taxAmount / 2;
            // Round individual components
            cgst = Math.round(cgst * 100.0) / 100.0;
            sgst = Math.round(sgst * 100.0) / 100.0;
        } else {
            igst = taxAmount;
        }

        String invoiceNumber = generateInvoiceNumber();

        Invoice invoice = Invoice.builder()
                .invoiceNumber(invoiceNumber)
                .order(order)
                .invoiceDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(30))
                .subtotal(baseAmount)
                .taxAmount(taxAmount)
                .cgstAmount(cgst)
                .sgstAmount(sgst)
                .igstAmount(igst)
                .totalAmount(finalOrderTotal)
                .discountAmount(0.0) // If Order has discount field, map it here
                .gstNumber(order.getUser().getRole().name().equals("BUSINESS") ? "GST-PENDING" : null) // Example logic
                .status(InvoiceStatus.GENERATED)
                .syncedToTally(false)
                .build();

        Invoice savedInvoice = invoiceRepository.save(invoice);
        log.info("Generated invoice {} for order {} (Total: {})", invoiceNumber, order.getId(), finalOrderTotal);

        return savedInvoice;
    }

    private Invoice updateExistingInvoice(Invoice invoice, Order order) {
        // Logic to update existing invoice with new order details
        // Re-using create logic but setting IDs
        // For simplicity in this fix, we will just delete old and create new or update
        // fields
        // Here we just update the amounts and tax

        Double finalOrderTotal = order.getTotalAmount();
        Double taxRate = 0.18;
        Double baseAmount = finalOrderTotal / (1.0 + taxRate);
        Double taxAmount = finalOrderTotal - baseAmount;

        baseAmount = Math.round(baseAmount * 100.0) / 100.0;
        taxAmount = Math.round(taxAmount * 100.0) / 100.0;

        String warehouseState = "Maharashtra";
        String customerState = (order.getShippingAddress() != null) ? order.getShippingAddress().getState()
                : "Maharashtra";

        if (customerState != null && customerState.trim().equalsIgnoreCase(warehouseState)) {
            invoice.setCgstAmount(taxAmount / 2);
            invoice.setSgstAmount(taxAmount / 2);
            invoice.setIgstAmount(0.0);
        } else {
            invoice.setIgstAmount(taxAmount);
            invoice.setCgstAmount(0.0);
            invoice.setSgstAmount(0.0);
        }

        invoice.setSubtotal(baseAmount);
        invoice.setTaxAmount(taxAmount);
        invoice.setTotalAmount(finalOrderTotal);
        invoice.setUpdatedAt(LocalDateTime.now());

        return invoiceRepository.save(invoice);
    }

    /**
     * Sync invoice to Tally
     */
    @Transactional
    public Invoice syncInvoiceToTally(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + invoiceId));

        Order order = invoice.getOrder();
        User customer = order.getUser();

        // Build Tally Sales Voucher DTO
        TallySalesVoucherDTO voucherDTO = buildSalesVoucherDTO(invoice, order, customer);

        // Sync to Tally
        TallySyncResponseDTO response = tallyIntegrationService.syncSalesVoucher(voucherDTO);

        // Update invoice with sync status
        invoice.setSyncedToTally(response.getSuccess());
        invoice.setLastSyncedAt(LocalDateTime.now());
        invoice.setTallySyncStatus(response.getSuccess() ? TallySyncStatus.SUCCESS : TallySyncStatus.FAILED);

        if (response.getSuccess()) {
            invoice.setTallyVoucherNumber(response.getVoucherNumber());
            invoice.setTallyMasterId(response.getMasterId());
            invoice.setTallyErrorMessage(null);
            log.info("Successfully synced invoice {} to Tally", invoice.getInvoiceNumber());
        } else {
            invoice.setTallyErrorMessage(response.getErrorMessage());
            log.error("Failed to sync invoice {} to Tally: {}",
                    invoice.getInvoiceNumber(), response.getErrorMessage());
        }

        return invoiceRepository.save(invoice);
    }

    /**
     * Sync product to Tally as Stock Item
     */
    public TallySyncResponseDTO syncProductToTally(Product product) {
        TallyStockItemDTO stockItemDTO = TallyStockItemDTO.builder()
                .name(product.getName())
                .alias(product.getId().toString())
                .category(product.getCategory() != null ? product.getCategory().getName() : "Products")
                .unit("Pcs")
                .openingBalance(product.getStockQuantity() != null ? product.getStockQuantity().doubleValue() : 0.0)
                .openingRate(product.getPrice())
                .gstApplicable("Yes")
                .gstRate(18.0) // Default 18% - you can make this configurable
                .build();

        return tallyIntegrationService.syncStockItem(stockItemDTO);
    }

    /**
     * Sync customer to Tally as Ledger
     */
    public TallySyncResponseDTO syncCustomerToTally(User customer, Address address) {
        String customerName = customer.getFirstName() + " " + customer.getLastName();

        TallyLedgerDTO ledgerDTO = TallyLedgerDTO.builder()
                .name(customerName)
                .alias(customer.getEmail())
                .parent("Sundry Debtors")
                .email(customer.getEmail())
                .phone(customer.getPhone())
                .openingBalance(0.0)
                .isDebit(true)
                .build();

        if (address != null) {
            ledgerDTO.setAddress(address.getStreetAddress());
            ledgerDTO.setCity(address.getCity());
            ledgerDTO.setState(address.getState());
            ledgerDTO.setPincode(address.getZipCode());
            ledgerDTO.setCountry(address.getCountry());
        }

        return tallyIntegrationService.syncLedger(ledgerDTO);
    }

    /**
     * Get all invoices
     */
    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    /**
     * Get invoice by ID
     */
    public Invoice getInvoiceById(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + id));
    }

    /**
     * Get invoice by order
     */
    public Optional<Invoice> getInvoiceByOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        return invoiceRepository.findByOrder(order);
    }

    /**
     * Get unsynced invoices
     */
    public List<Invoice> getUnsyncedInvoices() {
        return invoiceRepository.findBySyncedToTally(false);
    }

    /**
     * Bulk sync unsynced invoices to Tally
     */
    @Transactional
    public List<Invoice> syncAllUnsyncedInvoices() {
        List<Invoice> unsyncedInvoices = getUnsyncedInvoices();
        List<Invoice> syncedInvoices = new ArrayList<>();

        for (Invoice invoice : unsyncedInvoices) {
            try {
                Invoice synced = syncInvoiceToTally(invoice.getId());
                syncedInvoices.add(synced);
            } catch (Exception e) {
                log.error("Error syncing invoice {}: {}", invoice.getInvoiceNumber(), e.getMessage());
            }
        }

        return syncedInvoices;
    }

    /**
     * Update invoice status
     */
    @Transactional
    public Invoice updateInvoiceStatus(Long invoiceId, InvoiceStatus status) {
        Invoice invoice = getInvoiceById(invoiceId);
        invoice.setStatus(status);
        return invoiceRepository.save(invoice);
    }

    /**
     * Build Tally Sales Voucher DTO from Invoice
     */
    private TallySalesVoucherDTO buildSalesVoucherDTO(Invoice invoice, Order order, User customer) {
        List<TallySalesVoucherDTO.TallyInventoryEntry> inventoryEntries = new ArrayList<>();
        List<TallySalesVoucherDTO.TallyLedgerEntry> ledgerEntries = new ArrayList<>();

        // Add inventory entries from order items
        for (OrderItem item : order.getItems()) {
            inventoryEntries.add(TallySalesVoucherDTO.TallyInventoryEntry.builder()
                    .itemName(item.getProduct().getName())
                    .quantity(item.getQuantity())
                    .unit("Pcs")
                    .rate(item.getPrice())
                    .amount(item.getPrice() * item.getQuantity())
                    .build());
        }

        String customerName = customer.getFirstName() + " " + customer.getLastName();

        // Add ledger entries
        // 1. Debtor (Customer) - Debit
        ledgerEntries.add(TallySalesVoucherDTO.TallyLedgerEntry.builder()
                .ledgerName(customerName)
                .amount(invoice.getTotalAmount())
                .isDebit(true)
                .build());

        // 2. Sales - Credit
        ledgerEntries.add(TallySalesVoucherDTO.TallyLedgerEntry.builder()
                .ledgerName("Sales")
                .amount(-invoice.getSubtotal())
                .isDebit(false)
                .build());

        // 3. CGST - Credit
        if (invoice.getCgstAmount() != null && invoice.getCgstAmount() > 0) {
            ledgerEntries.add(TallySalesVoucherDTO.TallyLedgerEntry.builder()
                    .ledgerName("CGST")
                    .amount(-invoice.getCgstAmount())
                    .isDebit(false)
                    .build());
        }

        // 4. SGST - Credit
        if (invoice.getSgstAmount() != null && invoice.getSgstAmount() > 0) {
            ledgerEntries.add(TallySalesVoucherDTO.TallyLedgerEntry.builder()
                    .ledgerName("SGST")
                    .amount(-invoice.getSgstAmount())
                    .isDebit(false)
                    .build());
        }

        return TallySalesVoucherDTO.builder()
                .voucherNumber(invoice.getInvoiceNumber())
                .date(invoice.getInvoiceDate())
                .partyName(customerName)
                .partyAddress(order.getShippingAddress() != null ? order.getShippingAddress().getStreetAddress() : "")
                .narration("Sales Invoice for Order: " + order.getOrderNumber())
                .inventoryEntries(inventoryEntries)
                .ledgerEntries(ledgerEntries)
                .totalAmount(invoice.getTotalAmount())
                .build();
    }

    /**
     * Generate unique invoice number
     */
    private String generateInvoiceNumber() {
        String prefix = "INV";
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = invoiceRepository.count() + 1;
        return String.format("%s-%s-%04d", prefix, datePart, count);
    }

    /**
     * Sync all stock items from Tally and update local product stock
     */
    @Transactional
    public void syncAllStockFromTally() {
        log.info("Starting stock sync from Tally...");
        List<TallyProductDTO> tallyProducts = tallyIntegrationService.getStockItemsFromTally();

        int updatedCount = 0;
        for (TallyProductDTO tallyProduct : tallyProducts) {
            String name = tallyProduct.getName();
            String alias = tallyProduct.getAlias();
            Double closingBalance = tallyProduct.getClosingBalance();

            if (closingBalance != null) {
                java.util.Optional<Product> productOpt = java.util.Optional.empty();

                // 1. Try to find by ID (stored in Alias)
                if (alias != null && !alias.trim().isEmpty()) {
                    try {
                        Long id = Long.parseLong(alias.trim());
                        productOpt = productRepository.findById(id);
                    } catch (NumberFormatException e) {
                        // Alias is not a numeric ID, fallback to name
                    }
                }

                // 2. Fallback to find by Name
                if (productOpt.isEmpty() && name != null && !name.trim().isEmpty()) {
                    productOpt = productRepository.findByName(name.trim());
                }

                if (productOpt.isPresent()) {
                    Product product = productOpt.get();
                    product.setStockQuantity(closingBalance.intValue());
                    productRepository.save(product);
                    updatedCount++;
                } else {
                    log.warn("Could not find product in local database for Tally item: {} (Alias: {})", name, alias);
                }
            }
        }
        log.info("Stock sync completed correctly. Updated {} products.", updatedCount);
    }
}
