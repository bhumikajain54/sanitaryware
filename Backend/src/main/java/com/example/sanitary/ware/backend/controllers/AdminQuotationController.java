package com.example.sanitary.ware.backend.controllers;

import com.example.sanitary.ware.backend.dto.QuotationRequest;
import com.example.sanitary.ware.backend.entities.Quotation;
import com.example.sanitary.ware.backend.services.FileStorageService;
import com.example.sanitary.ware.backend.services.QuotationImportService;
import com.example.sanitary.ware.backend.services.QuotationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/admin/quotations")
@RequiredArgsConstructor
public class AdminQuotationController {

    private final QuotationService quotationService;
    private final QuotationImportService importService;
    private final FileStorageService fileStorageService;

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Quotation Controller is Working!");
    }

    @PostMapping
    public ResponseEntity<Quotation> createQuotation(@RequestBody QuotationRequest request) {
        return ResponseEntity.ok(quotationService.createQuotation(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Quotation> updateQuotation(@PathVariable Long id, @RequestBody QuotationRequest request) {
        return ResponseEntity.ok(quotationService.updateQuotation(id, request));
    }

    @GetMapping
    public ResponseEntity<List<Quotation>> getAllQuotations() {
        return ResponseEntity.ok(quotationService.getAllQuotations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Quotation> getQuotationById(@PathVariable Long id) {
        return ResponseEntity.ok(quotationService.getQuotation(id));
    }

    @PostMapping("/{id}/send-whatsapp")
    public ResponseEntity<Void> sendToWhatsApp(@PathVariable Long id) {
        quotationService.sendQuotationToWhatsApp(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/import")
    public ResponseEntity<Quotation> importQuotation(
            @RequestParam("file") MultipartFile file,
            @RequestParam("customerName") String customerName,
            @RequestParam(value = "customerPhone", required = false) String customerPhone) {

        List<QuotationRequest.QuotationItemRequest> items;
        String filename = fileStorageService.save(file);

        if (file.getOriginalFilename().endsWith(".csv")) {
            items = importService.parseCsv(file);
        } else if (file.getOriginalFilename().endsWith(".pdf")) {
            items = importService.parsePdf(file);
        } else {
            // For images or others, we create an empty quotation with the file attached
            items = new ArrayList<>();
        }

        QuotationRequest request = new QuotationRequest();
        request.setCustomerName(customerName);
        request.setCustomerPhone(customerPhone);
        request.setItems(items);

        Quotation quotation = quotationService.createQuotation(request);
        quotation.setReferenceFile(filename);
        quotation.setInternalNotes("Imported from " + file.getOriginalFilename());

        // Ensure quotation is updated with the file reference
        return ResponseEntity.ok(quotationService.saveQuotation(quotation));
    }

    @PutMapping("/{id}/import")
    public ResponseEntity<Quotation> updateImportQuotation(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {

        List<QuotationRequest.QuotationItemRequest> items;
        String filename = fileStorageService.save(file);

        if (file.getOriginalFilename().endsWith(".csv")) {
            items = importService.parseCsv(file);
        } else if (file.getOriginalFilename().endsWith(".pdf")) {
            items = importService.parsePdf(file);
        } else {
            items = new ArrayList<>();
        }

        Quotation quotation = quotationService.getQuotation(id);

        // Use existing customer info but update items from new file
        QuotationRequest request = new QuotationRequest();
        request.setCustomerName(quotation.getCustomerName());
        request.setCustomerPhone(quotation.getCustomerPhone());
        request.setCustomerEmail(quotation.getCustomerEmail());
        request.setCustomerAddress(quotation.getCustomerAddress());
        request.setItems(items);

        Quotation updatedQuotation = quotationService.updateQuotation(id, request);
        updatedQuotation.setReferenceFile(filename);
        updatedQuotation.setInternalNotes(
                updatedQuotation.getInternalNotes() + "\nUpdated via import from " + file.getOriginalFilename());

        return ResponseEntity.ok(quotationService.saveQuotation(updatedQuotation));
    }
}
