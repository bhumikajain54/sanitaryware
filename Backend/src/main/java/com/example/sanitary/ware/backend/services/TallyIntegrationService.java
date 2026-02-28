package com.example.sanitary.ware.backend.services;

import com.example.sanitary.ware.backend.config.TallyProperties;
import com.example.sanitary.ware.backend.dto.tally.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import org.springframework.stereotype.Service;

/**
 * Core service for Tally ERP integration
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TallyIntegrationService {

    private final org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();

    private final TallyProperties tallyProperties;
    private final TallyXmlBuilderService xmlBuilder;
    private final ProductService productService;

    /**
     * Test connection to Tally
     */
    public boolean testConnection() {
        if (!tallyProperties.isEnabled()) {
            log.warn("Tally integration is disabled");
            return false;
        }

        try {
            String xml = xmlBuilder.buildTestConnectionXml();
            String response = sendToTally(xml);

            // Check if response contains company information
            boolean connected = response != null && response.contains("<COMPANY>");

            if (connected) {
                log.info("Successfully connected to Tally at {}:{}",
                        tallyProperties.getHost(), tallyProperties.getPort());
            } else {
                log.error("Failed to connect to Tally. Response: {}", response);
            }

            return connected;
        } catch (Exception e) {
            log.error("Error testing Tally connection: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Sync Sales Voucher to Tally
     */
    public TallySyncResponseDTO syncSalesVoucher(TallySalesVoucherDTO voucher) {
        if (!tallyProperties.isEnabled()) {
            return TallySyncResponseDTO.builder()
                    .success(false)
                    .errorMessage("Tally integration is disabled")
                    .build();
        }

        try {
            String xml = xmlBuilder.buildSalesVoucherXml(voucher);
            log.debug("Sending sales voucher XML to Tally: {}", xml);

            String response = sendToTally(xml);

            // Parse response to check for success
            boolean success = isSuccessResponse(response);

            if (success) {
                log.info("Successfully synced sales voucher {} to Tally", voucher.getVoucherNumber());
                return TallySyncResponseDTO.builder()
                        .success(true)
                        .voucherNumber(voucher.getVoucherNumber())
                        .tallyResponse(response)
                        .build();
            } else {
                String errorMessage = extractErrorMessage(response);
                log.error("Failed to sync sales voucher to Tally: {}", errorMessage);
                return TallySyncResponseDTO.builder()
                        .success(false)
                        .errorMessage(errorMessage)
                        .tallyResponse(response)
                        .build();
            }
        } catch (Exception e) {
            log.error("Error syncing sales voucher to Tally: {}", e.getMessage(), e);
            return TallySyncResponseDTO.builder()
                    .success(false)
                    .errorMessage(e.getMessage())
                    .build();
        }
    }

    /**
     * Sync Purchase Voucher to Tally
     */
    public TallySyncResponseDTO syncPurchaseVoucher(TallyPurchaseVoucherDTO voucher) {
        if (!tallyProperties.isEnabled()) {
            return TallySyncResponseDTO.builder()
                    .success(false)
                    .errorMessage("Tally integration is disabled")
                    .build();
        }

        try {
            String xml = xmlBuilder.buildPurchaseVoucherXml(voucher);
            log.debug("Sending purchase voucher XML to Tally: {}", xml);

            String response = sendToTally(xml);

            // Parse response to check for success
            boolean success = isSuccessResponse(response);

            if (success) {
                log.info("Successfully synced purchase voucher {} to Tally", voucher.getVoucherNumber());

                // Update local stock if sync was successful
                if (voucher.getInventoryEntries() != null) {
                    for (TallyPurchaseVoucherDTO.TallyInventoryEntry entry : voucher.getInventoryEntries()) {
                        try {
                            productService.incrementStock(entry.getItemName(), entry.getQuantity().intValue());
                        } catch (Exception e) {
                            log.error("Failed to increment stock for {}: {}", entry.getItemName(), e.getMessage());
                        }
                    }
                }

                return TallySyncResponseDTO.builder()
                        .success(true)
                        .voucherNumber(voucher.getVoucherNumber())
                        .tallyResponse(response)
                        .build();
            } else {
                String errorMessage = extractErrorMessage(response);
                log.error("Failed to sync purchase voucher to Tally: {}", errorMessage);
                return TallySyncResponseDTO.builder()
                        .success(false)
                        .errorMessage(errorMessage)
                        .tallyResponse(response)
                        .build();
            }
        } catch (Exception e) {
            log.error("Error syncing purchase voucher to Tally: {}", e.getMessage(), e);
            return TallySyncResponseDTO.builder()
                    .success(false)
                    .errorMessage(e.getMessage())
                    .build();
        }
    }

    /**
     * Sync Stock Item to Tally
     */
    public TallySyncResponseDTO syncStockItem(TallyStockItemDTO stockItem) {
        if (!tallyProperties.isEnabled()) {
            return TallySyncResponseDTO.builder()
                    .success(false)
                    .errorMessage("Tally integration is disabled")
                    .build();
        }

        try {
            String xml = xmlBuilder.buildStockItemXml(stockItem);
            log.debug("Sending stock item XML to Tally: {}", xml);

            String response = sendToTally(xml);
            boolean success = isSuccessResponse(response);

            if (success) {
                log.info("Successfully synced stock item {} to Tally", stockItem.getName());
                return TallySyncResponseDTO.builder()
                        .success(true)
                        .tallyResponse(response)
                        .build();
            } else {
                String errorMessage = extractErrorMessage(response);
                log.error("Failed to sync stock item to Tally: {}", errorMessage);
                return TallySyncResponseDTO.builder()
                        .success(false)
                        .errorMessage(errorMessage)
                        .tallyResponse(response)
                        .build();
            }
        } catch (Exception e) {
            log.error("Error syncing stock item to Tally: {}", e.getMessage(), e);
            return TallySyncResponseDTO.builder()
                    .success(false)
                    .errorMessage(e.getMessage())
                    .build();
        }
    }

    /**
     * Sync Ledger (Customer) to Tally
     */
    public TallySyncResponseDTO syncLedger(TallyLedgerDTO ledger) {
        if (!tallyProperties.isEnabled()) {
            return TallySyncResponseDTO.builder()
                    .success(false)
                    .errorMessage("Tally integration is disabled")
                    .build();
        }

        try {
            String xml = xmlBuilder.buildLedgerXml(ledger);
            log.debug("Sending ledger XML to Tally: {}", xml);

            String response = sendToTally(xml);
            boolean success = isSuccessResponse(response);

            if (success) {
                log.info("Successfully synced ledger {} to Tally", ledger.getName());
                return TallySyncResponseDTO.builder()
                        .success(true)
                        .tallyResponse(response)
                        .build();
            } else {
                String errorMessage = extractErrorMessage(response);
                log.error("Failed to sync ledger to Tally: {}", errorMessage);
                return TallySyncResponseDTO.builder()
                        .success(false)
                        .errorMessage(errorMessage)
                        .tallyResponse(response)
                        .build();
            }
        } catch (Exception e) {
            log.error("Error syncing ledger to Tally: {}", e.getMessage(), e);
            return TallySyncResponseDTO.builder()
                    .success(false)
                    .errorMessage(e.getMessage())
                    .build();
        }
    }

    /**
     * Send XML request to Tally
     */
    private String sendToTally(String xmlRequest) {
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_XML);

        org.springframework.http.HttpEntity<String> request = new org.springframework.http.HttpEntity<>(xmlRequest,
                headers);

        return restTemplate.postForObject(tallyProperties.getBaseUrl(), request, String.class);
    }

    /**
     * Check if Tally response indicates success
     */
    private boolean isSuccessResponse(String response) {
        if (response == null || response.isEmpty()) {
            return false;
        }

        // Tally returns success if no error tags are present
        // and if CREATED or ALTERED tags are present
        return !response.contains("<LINEERROR>") &&
                !response.contains("<ERROR>") &&
                (response.contains("<CREATED>") ||
                        response.contains("<ALTERED>") ||
                        response.contains("<COMPANY>"));
    }

    /**
     * Extract error message from Tally response
     */
    private String extractErrorMessage(String response) {
        if (response == null) {
            return "No response from Tally";
        }

        // Try to extract error from LINEERROR tag
        int errorStart = response.indexOf("<LINEERROR>");
        if (errorStart != -1) {
            int errorEnd = response.indexOf("</LINEERROR>", errorStart);
            if (errorEnd != -1) {
                return response.substring(errorStart + 11, errorEnd).trim();
            }
        }

        // Try to extract from ERROR tag
        errorStart = response.indexOf("<ERROR>");
        if (errorStart != -1) {
            int errorEnd = response.indexOf("</ERROR>", errorStart);
            if (errorEnd != -1) {
                return response.substring(errorStart + 7, errorEnd).trim();
            }
        }

        return "Unknown error occurred while syncing to Tally";
    }

    /**
     * Fetch all stock items/products from Tally
     */
    public List<com.example.sanitary.ware.backend.dto.tally.TallyProductDTO> getStockItemsFromTally() {
        if (!tallyProperties.isEnabled()) {
            log.warn("Tally integration is disabled");
            return new java.util.ArrayList<>();
        }

        try {
            String xml = xmlBuilder.buildGetStockItemsXml();
            String response = sendToTally(xml);

            // Parse XML response and extract stock items
            return parseStockItemsResponse(response);
        } catch (Exception e) {
            log.error("Error fetching stock items from Tally: {}", e.getMessage(), e);
            return new java.util.ArrayList<>();
        }
    }

    /**
     * Fetch all ledgers from Tally
     */
    public List<TallyLedgerDTO> getLedgersFromTally() {
        if (!tallyProperties.isEnabled()) {
            log.warn("Tally integration is disabled");
            return new java.util.ArrayList<>();
        }

        try {
            String xml = xmlBuilder.buildGetLedgersXml();
            String response = sendToTally(xml);

            // Parse XML response and extract ledgers
            return parseLedgersResponse(response);
        } catch (Exception e) {
            log.error("Error fetching ledgers from Tally: {}", e.getMessage(), e);
            return new java.util.ArrayList<>();
        }
    }

    /**
     * Parse Tally XML response to extract ledgers
     */
    private List<TallyLedgerDTO> parseLedgersResponse(String response) {
        java.util.List<TallyLedgerDTO> ledgers = new java.util.ArrayList<>();

        if (response == null || response.isEmpty()) {
            return ledgers;
        }

        try {
            String[] items = response.split("<LEDGER>");

            for (int i = 1; i < items.length; i++) {
                String itemXml = items[i];

                TallyLedgerDTO ledger = new TallyLedgerDTO();

                ledger.setName(extractXmlValue(itemXml, "NAME"));
                ledger.setParent(extractXmlValue(itemXml, "PARENT"));
                ledger.setGuid(extractXmlValue(itemXml, "GUID"));

                try {
                    String openingBalance = extractXmlValue(itemXml, "OPENINGBALANCE");
                    if (openingBalance != null && !openingBalance.isEmpty()) {
                        ledger.setOpeningBalance(Double.parseDouble(openingBalance.replaceAll("[^0-9.-]", "")));
                    }
                } catch (NumberFormatException e) {
                    log.warn("Error parsing opening balance for ledger: {}", e.getMessage());
                }

                // Note: More fields can be extracted here

                ledgers.add(ledger);
            }
        } catch (Exception e) {
            log.error("Error parsing ledgers response: {}", e.getMessage(), e);
        }

        return ledgers;
    }

    /**
     * Automatically sync order to Tally when order is placed
     * This creates a sales voucher in Tally for the order
     */
    public TallySyncResponseDTO syncOrderToTally(com.example.sanitary.ware.backend.entities.Order order) {
        if (!tallyProperties.isEnabled()) {
            return TallySyncResponseDTO.builder()
                    .success(false)
                    .errorMessage("Tally integration is disabled")
                    .build();
        }

        try {
            // Build Sales Voucher DTO from Order
            TallySalesVoucherDTO voucher = buildSalesVoucherFromOrder(order);

            // Sync to Tally
            return syncSalesVoucher(voucher);
        } catch (Exception e) {
            log.error("Error syncing order {} to Tally: {}", order.getOrderNumber(), e.getMessage(), e);
            return TallySyncResponseDTO.builder()
                    .success(false)
                    .errorMessage(e.getMessage())
                    .build();
        }
    }

    /**
     * Build TallySalesVoucherDTO from Order entity
     */
    private TallySalesVoucherDTO buildSalesVoucherFromOrder(com.example.sanitary.ware.backend.entities.Order order) {
        // Create inventory entries from order items
        java.util.List<TallySalesVoucherDTO.TallyInventoryEntry> inventoryEntries = order.getItems().stream()
                .map(item -> {
                    TallySalesVoucherDTO.TallyInventoryEntry entry = new TallySalesVoucherDTO.TallyInventoryEntry();
                    entry.setItemName(item.getProduct().getName());
                    entry.setQuantity(item.getQuantity()); // Already Integer
                    entry.setUnit("Nos"); // Default unit, can be customized
                    entry.setRate(item.getPrice());
                    entry.setAmount(item.getPrice() * item.getQuantity());
                    return entry;
                })
                .collect(java.util.stream.Collectors.toList());

        // Create ledger entries (Sales and Party Ledger)
        java.util.List<TallySalesVoucherDTO.TallyLedgerEntry> ledgerEntries = new java.util.ArrayList<>();

        // Party Ledger (Customer) - Debit
        TallySalesVoucherDTO.TallyLedgerEntry partyLedger = new TallySalesVoucherDTO.TallyLedgerEntry();
        String customerName = order.getUser().getFirstName() + " " + order.getUser().getLastName();
        partyLedger.setLedgerName(customerName);
        partyLedger.setAmount(order.getTotalAmount());
        partyLedger.setIsDebit(true);
        ledgerEntries.add(partyLedger);

        // Sales Ledger - Credit
        TallySalesVoucherDTO.TallyLedgerEntry salesLedger = new TallySalesVoucherDTO.TallyLedgerEntry();
        salesLedger.setLedgerName("Sales");
        salesLedger.setAmount(-order.getTotalAmount()); // Negative for credit
        salesLedger.setIsDebit(false);
        ledgerEntries.add(salesLedger);

        // Build the voucher
        TallySalesVoucherDTO voucher = new TallySalesVoucherDTO();
        voucher.setVoucherNumber(order.getOrderNumber());
        voucher.setDate(java.time.LocalDate.now());
        String partyName = order.getUser().getFirstName() + " " + order.getUser().getLastName();
        voucher.setPartyName(partyName);
        voucher.setNarration("Online Order: " + order.getOrderNumber());
        voucher.setInventoryEntries(inventoryEntries);
        voucher.setLedgerEntries(ledgerEntries);

        return voucher;
    }

    /**
     * Parse Tally XML response to extract stock items
     */
    private java.util.List<com.example.sanitary.ware.backend.dto.tally.TallyProductDTO> parseStockItemsResponse(
            String response) {
        java.util.List<com.example.sanitary.ware.backend.dto.tally.TallyProductDTO> products = new java.util.ArrayList<>();

        if (response == null || response.isEmpty()) {
            return products;
        }

        try {
            // Simple XML parsing - extract stock item data
            // Note: For production, consider using a proper XML parser like JAXB or DOM
            String[] items = response.split("<STOCKITEM>");

            for (int i = 1; i < items.length; i++) {
                String itemXml = items[i];

                com.example.sanitary.ware.backend.dto.tally.TallyProductDTO product = new com.example.sanitary.ware.backend.dto.tally.TallyProductDTO();

                product.setName(extractXmlValue(itemXml, "NAME"));
                product.setAlias(extractXmlValue(itemXml, "ALIAS"));
                product.setParent(extractXmlValue(itemXml, "PARENT"));
                product.setBaseUnits(extractXmlValue(itemXml, "BASEUNITS"));
                product.setHsnCode(extractXmlValue(itemXml, "HSNCODE"));
                product.setGstApplicable(extractXmlValue(itemXml, "GSTAPPLICABLE"));
                product.setGuid(extractXmlValue(itemXml, "GUID"));

                // Parse numeric values
                try {
                    String closingBalance = extractXmlValue(itemXml, "CLOSINGBALANCE");
                    if (closingBalance != null && !closingBalance.isEmpty()) {
                        product.setClosingBalance(Double.parseDouble(closingBalance.replaceAll("[^0-9.-]", "")));
                    }

                    String closingValue = extractXmlValue(itemXml, "CLOSINGVALUE");
                    if (closingValue != null && !closingValue.isEmpty()) {
                        product.setClosingValue(Double.parseDouble(closingValue.replaceAll("[^0-9.-]", "")));
                    }

                    String closingRate = extractXmlValue(itemXml, "CLOSINGRATE");
                    if (closingRate != null && !closingRate.isEmpty()) {
                        product.setClosingRate(Double.parseDouble(closingRate.replaceAll("[^0-9.-]", "")));
                    }
                } catch (NumberFormatException e) {
                    log.warn("Error parsing numeric values for stock item: {}", e.getMessage());
                }

                products.add(product);
            }
        } catch (Exception e) {
            log.error("Error parsing stock items response: {}", e.getMessage(), e);
        }

        return products;
    }

    /**
     * Fetch all voucher types from Tally
     */
    public List<TallyVoucherTypeDTO> getVoucherTypesFromTally() {
        if (!tallyProperties.isEnabled()) {
            log.warn("Tally integration is disabled");
            return new java.util.ArrayList<>();
        }

        try {
            String xml = xmlBuilder.buildGetVoucherTypesXml();
            String response = sendToTally(xml);

            // Parse XML response and extract voucher types
            return parseVoucherTypesResponse(response);
        } catch (Exception e) {
            log.error("Error fetching voucher types from Tally: {}", e.getMessage(), e);
            return new java.util.ArrayList<>();
        }
    }

    /**
     * Parse Tally XML response to extract voucher types
     */
    private List<TallyVoucherTypeDTO> parseVoucherTypesResponse(String response) {
        java.util.List<TallyVoucherTypeDTO> voucherTypes = new java.util.ArrayList<>();

        if (response == null || response.isEmpty()) {
            return voucherTypes;
        }

        try {
            String[] items = response.split("<VOUCHERTYPE>");

            for (int i = 1; i < items.length; i++) {
                String itemXml = items[i];

                TallyVoucherTypeDTO type = new TallyVoucherTypeDTO();

                type.setName(extractXmlValue(itemXml, "NAME"));
                type.setParent(extractXmlValue(itemXml, "PARENT"));
                type.setNumberingMethod(extractXmlValue(itemXml, "NUMBERINGMETHOD"));
                String isDeemedPositive = extractXmlValue(itemXml, "ISDEEMEDPOSITIVE");
                type.setIsDeemedPositive(isDeemedPositive != null && isDeemedPositive.equalsIgnoreCase("Yes"));

                voucherTypes.add(type);
            }
        } catch (Exception e) {
            log.error("Error parsing voucher types response: {}", e.getMessage(), e);
        }

        return voucherTypes;
    }

    /**
     * Extract value from XML tag
     */
    private String extractXmlValue(String xml, String tagName) {
        String openTag = "<" + tagName + ">";
        String closeTag = "</" + tagName + ">";

        int startIndex = xml.indexOf(openTag);
        if (startIndex == -1) {
            return null;
        }

        int endIndex = xml.indexOf(closeTag, startIndex);
        if (endIndex == -1) {
            return null;
        }

        return xml.substring(startIndex + openTag.length(), endIndex).trim();
    }
}
