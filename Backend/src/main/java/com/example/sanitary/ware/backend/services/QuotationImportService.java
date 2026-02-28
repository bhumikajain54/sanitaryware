package com.example.sanitary.ware.backend.services;

import com.example.sanitary.ware.backend.dto.QuotationRequest;
import com.example.sanitary.ware.backend.entities.Product;
import com.example.sanitary.ware.backend.repositories.ProductRepository;
import com.opencsv.CSVReader;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuotationImportService {

    private final ProductRepository productRepository;

    /**
     * Parses a CSV file into a list of QuotationItemRequests.
     * Expected format: SKU, Quantity, [Optional] Price, [Optional] Discount
     */
    public List<QuotationRequest.QuotationItemRequest> parseCsv(MultipartFile file) {
        List<QuotationRequest.QuotationItemRequest> items = new ArrayList<>();
        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            String[] line;
            boolean firstLine = true;
            while ((line = reader.readNext()) != null) {
                if (firstLine) {
                    firstLine = false;
                    continue;
                } // Skip header
                if (line.length < 2)
                    continue;

                String name = line[0].trim();
                Integer quantity = Integer.parseInt(line[1].trim());

                Product product = productRepository.findByNameIgnoreCase(name)
                        .orElse(null);

                if (product != null) {
                    QuotationRequest.QuotationItemRequest item = new QuotationRequest.QuotationItemRequest();
                    item.setProductId(product.getId());
                    item.setQuantity(quantity);
                    if (line.length >= 3 && !line[2].isEmpty()) {
                        item.setManualPrice(Double.parseDouble(line[2].trim()));
                    }
                    if (line.length >= 4 && !line[3].isEmpty()) {
                        item.setDiscountPercentage(Double.parseDouble(line[3].trim()));
                    }
                    items.add(item);
                }
            }
        } catch (Exception e) {
            log.error("Error parsing Quotation CSV: {}", e.getMessage());
            throw new RuntimeException("CSV Parsing Failed: " + e.getMessage());
        }
        return items;
    }

    /**
     * Attempts to find SKUs and quantities in a PDF file using basic text
     * extraction.
     * This is heuristic and works best with clean, text-based PDFs.
     */
    public List<QuotationRequest.QuotationItemRequest> parsePdf(MultipartFile file) {
        List<QuotationRequest.QuotationItemRequest> items = new ArrayList<>();
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);

            // Simple pattern: [SKU] [Quantity]
            // We'll look for SKUs already in our database
            List<Product> allProducts = productRepository.findAll();
            for (Product product : allProducts) {
                if (product.getName() == null || product.getName().isEmpty())
                    continue;

                // Regex to find name followed by some characters and then a number (quantity)
                Pattern pattern = Pattern.compile(Pattern.quote(product.getName()) + "\\s+(\\d+)",
                        Pattern.CASE_INSENSITIVE);
                Matcher matcher = pattern.matcher(text);

                while (matcher.find()) {
                    QuotationRequest.QuotationItemRequest item = new QuotationRequest.QuotationItemRequest();
                    item.setProductId(product.getId());
                    item.setQuantity(Integer.parseInt(matcher.group(1)));
                    items.add(item);
                }
            }
        } catch (Exception e) {
            log.error("Error parsing Quotation PDF: {}", e.getMessage());
            throw new RuntimeException("PDF Parsing Failed: " + e.getMessage());
        }
        return items;
    }

    /**
     * For images, we currently store the file for manual entry reference.
     * Automated OCR can be added here using a library like Tesseract or a cloud
     * API.
     */
    public List<QuotationRequest.QuotationItemRequest> parseImage(MultipartFile file) {
        log.info("Image upload received for quotation reference: {}", file.getOriginalFilename());
        // For now, return empty list as image-to-item conversion requires OCR
        return new ArrayList<>();
    }
}
