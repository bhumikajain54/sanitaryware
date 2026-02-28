package com.example.sanitary.ware.backend.services;

import com.example.sanitary.ware.backend.dto.QuotationRequest;
import com.example.sanitary.ware.backend.entities.Product;
import com.example.sanitary.ware.backend.entities.Quotation;
import com.example.sanitary.ware.backend.entities.QuotationItem;
import com.example.sanitary.ware.backend.repositories.ProductRepository;
import com.example.sanitary.ware.backend.repositories.QuotationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QuotationService {

    private final QuotationRepository quotationRepository;
    private final ProductRepository productRepository;
    private final WhatsAppService whatsAppService;

    @Transactional
    public Quotation createQuotation(QuotationRequest request) {

        Quotation quotation = new Quotation();
        quotation.setQuotationNumber("QT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        quotation.setCustomerName(request.getCustomerName());
        quotation.setCustomerPhone(request.getCustomerPhone());
        quotation.setCustomerEmail(request.getCustomerEmail());
        quotation.setCustomerAddress(request.getCustomerAddress());
        quotation.setStatus("DRAFT");

        List<QuotationItem> items = new ArrayList<>();
        double totalAmount = 0.0;

        for (QuotationRequest.QuotationItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + itemRequest.getProductId()));

            QuotationItem item = new QuotationItem();
            item.setQuotation(quotation);
            item.setProduct(product);
            item.setProductName(product.getName());
            item.setQuantity(itemRequest.getQuantity());

            // Track the real price from catalog
            item.setOriginalPrice(product.getPrice());

            double price = (itemRequest.getManualPrice() != null) ? itemRequest.getManualPrice() : product.getPrice();
            item.setPrice(price);

            double discount = 0.0;
            if (itemRequest.getDiscountPercentage() != null && itemRequest.getDiscountPercentage() > 0) {
                item.setDiscountPercentage(itemRequest.getDiscountPercentage());
                discount = (price * itemRequest.getQuantity()) * (itemRequest.getDiscountPercentage() / 100);
            } else if (itemRequest.getDiscount() != null) {
                discount = itemRequest.getDiscount();
            }
            item.setDiscount(discount);

            double itemTotal = (price * itemRequest.getQuantity()) - discount;
            totalAmount += itemTotal;

            items.add(item);
        }

        quotation.setItems(items);
        quotation.setTotalAmount(totalAmount);

        Quotation savedQuotation = quotationRepository.save(quotation);
        return savedQuotation;
    }

    @Transactional
    public Quotation updateQuotation(Long id, QuotationRequest request) {
        Quotation quotation = getQuotation(id);

        quotation.setCustomerName(request.getCustomerName());
        quotation.setCustomerPhone(request.getCustomerPhone());
        quotation.setCustomerEmail(request.getCustomerEmail());
        quotation.setCustomerAddress(request.getCustomerAddress());

        // Clear existing items and rebuild
        quotation.getItems().clear();

        List<QuotationItem> items = new ArrayList<>();
        double totalAmount = 0.0;

        for (QuotationRequest.QuotationItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + itemRequest.getProductId()));

            QuotationItem item = new QuotationItem();
            item.setQuotation(quotation);
            item.setProduct(product);
            item.setProductName(product.getName());
            item.setQuantity(itemRequest.getQuantity());

            item.setOriginalPrice(product.getPrice());

            double price = (itemRequest.getManualPrice() != null) ? itemRequest.getManualPrice() : product.getPrice();
            item.setPrice(price);

            double discount = 0.0;
            if (itemRequest.getDiscountPercentage() != null && itemRequest.getDiscountPercentage() > 0) {
                item.setDiscountPercentage(itemRequest.getDiscountPercentage());
                discount = (price * itemRequest.getQuantity()) * (itemRequest.getDiscountPercentage() / 100);
            } else if (itemRequest.getDiscount() != null) {
                discount = itemRequest.getDiscount();
            }
            item.setDiscount(discount);

            double itemTotal = (price * itemRequest.getQuantity()) - discount;
            totalAmount += itemTotal;
            items.add(item);
        }

        quotation.getItems().addAll(items);
        quotation.setTotalAmount(totalAmount);

        return quotationRepository.save(quotation);
    }

    public Quotation getQuotation(Long id) {
        return quotationRepository.findById(id).orElseThrow(() -> new RuntimeException("Quotation not found"));
    }

    public List<Quotation> getAllQuotations() {
        return quotationRepository.findAll();
    }

    public Quotation saveQuotation(Quotation quotation) {
        return quotationRepository.save(quotation);
    }

    public void sendQuotationToWhatsApp(Long quotationId) {
        Quotation quotation = getQuotation(quotationId);
        if (quotation.getCustomerPhone() == null || quotation.getCustomerPhone().isEmpty()) {
            throw new RuntimeException("Customer phone number not available");
        }

        StringBuilder summary = new StringBuilder();
        summary.append("*Your Quotation: ").append(quotation.getQuotationNumber()).append("*\n\n");

        for (QuotationItem item : quotation.getItems()) {
            summary.append("- ").append(item.getProductName())
                    .append(" (x").append(item.getQuantity()).append(")");

            summary.append("\n  Price: ").append(String.format("%.2f", item.getTotal())).append("\n");
        }

        summary.append("\n*Total: ").append(String.format("%.2f", quotation.getTotalAmount())).append("*");
        summary.append("\n\nVisit us to finalize!");

        whatsAppService.sendTextMessage(quotation.getCustomerPhone(), summary.toString());

        // Update status if needed
        quotation.setStatus("SENT");
        quotationRepository.save(quotation);
    }
}
