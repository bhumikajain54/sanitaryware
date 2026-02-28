package com.example.sanitary.ware.backend.services;

import com.example.sanitary.ware.backend.dto.OrderDraftRequest;
import com.example.sanitary.ware.backend.entities.*;
import com.example.sanitary.ware.backend.enums.OrderStatus;
import com.example.sanitary.ware.backend.enums.PaymentStatus;
import com.example.sanitary.ware.backend.enums.Role;
import com.example.sanitary.ware.backend.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderDraftService {

    private final OrderDraftRepository orderDraftRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductService productService;
    private final TallyIntegrationService tallyIntegrationService;
    private final WhatsAppService whatsAppService;

    @Transactional
    public OrderDraft createDraft(OrderDraftRequest request) {
        OrderDraft draft = new OrderDraft();
        draft.setDraftNumber("DRFT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        return updateDraftData(draft, request);
    }

    @Transactional
    public OrderDraft updateDraft(Long id, OrderDraftRequest request) {
        OrderDraft draft = orderDraftRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Draft not found"));

        if ("CONFIRMED".equals(draft.getStatus())) {
            throw new RuntimeException("Cannot update a confirmed draft");
        }

        return updateDraftData(draft, request);
    }

    private OrderDraft updateDraftData(OrderDraft draft, OrderDraftRequest request) {
        draft.setCustomerName(request.getCustomerName());
        draft.setCustomerPhone(request.getCustomerPhone());
        draft.setCustomerEmail(request.getCustomerEmail());
        draft.setCustomerAddress(request.getCustomerAddress());
        draft.setTourLocation(request.getTourLocation());
        draft.setSalesPersonName(request.getSalesPersonName());
        draft.setInternalNotes(request.getInternalNotes());
        draft.setStatus("DRAFT");

        if (draft.getItems() == null) {
            draft.setItems(new ArrayList<>());
        } else {
            draft.getItems().clear();
        }

        double totalAmount = 0.0;
        List<OrderDraftItem> items = new ArrayList<>();

        for (OrderDraftRequest.DraftItemRequest itemRequest : request.getItems()) {
            OrderDraftItem item = new OrderDraftItem();
            item.setOrderDraft(draft);
            item.setQuantity(itemRequest.getQuantity());

            if (itemRequest.getProductId() != null) {
                Product product = productRepository.findById(itemRequest.getProductId())
                        .orElse(null);
                if (product != null) {
                    item.setProduct(product);
                    item.setProductName(product.getName());
                    item.setOriginalPrice(product.getPrice());
                }
            }

            if (item.getProductName() == null || item.getProductName().isEmpty()) {
                item.setProductName(itemRequest.getName());
            }

            double price = (itemRequest.getRate() != null) ? itemRequest.getRate()
                    : (itemRequest.getManualPrice() != null ? itemRequest.getManualPrice() : 0.0);
            item.setPrice(price);

            double discount = 0.0;
            if (itemRequest.getDiscountPercentage() != null) {
                item.setDiscountPercentage(itemRequest.getDiscountPercentage());
                discount = (price * itemRequest.getQuantity()) * (itemRequest.getDiscountPercentage() / 100);
            } else if (itemRequest.getDiscount() != null) {
                discount = itemRequest.getDiscount();
            }
            item.setDiscount(discount);

            totalAmount += (price * (itemRequest.getQuantity() != null ? itemRequest.getQuantity() : 0)) - discount;
            items.add(item);
        }

        draft.getItems().addAll(items);
        draft.setTotalAmount(totalAmount);
        return orderDraftRepository.save(draft);
    }

    @Transactional
    public Order convertToOrder(Long draftId, Long adminId) {
        OrderDraft draft = orderDraftRepository.findById(draftId)
                .orElseThrow(() -> new RuntimeException("Draft not found"));

        if ("CONFIRMED".equals(draft.getStatus())) {
            throw new RuntimeException("Draft already converted to order");
        }

        // 1. Find or Create a Customer User for this order
        User customer = userRepository.findByPhone(draft.getCustomerPhone())
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .firstName(draft.getCustomerName())
                            .lastName("Guest")
                            .phone(draft.getCustomerPhone())
                            .email(draft.getCustomerEmail() != null ? draft.getCustomerEmail()
                                    : draft.getCustomerPhone() + "@guest.com")
                            .password("FIELD_GUEST_" + UUID.randomUUID().toString().substring(0, 4))
                            .role(Role.CUSTOMER)
                            .build();
                    return userRepository.save(newUser);
                });

        // 2. Create the Real Order
        Order order = Order.builder()
                .orderNumber("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .user(customer)
                .totalAmount(draft.getTotalAmount())
                .status(OrderStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .paymentMethod("FIELD_COLLECTION")
                .source("TOUR")
                .tourLocation(draft.getTourLocation())
                .salesPersonName(draft.getSalesPersonName())
                .orderNotes(draft.getInternalNotes())
                .build();

        Order savedOrder = orderRepository.save(order);

        // 3. Convert Items
        List<OrderItem> orderItems = new ArrayList<>();
        for (OrderDraftItem dItem : draft.getItems()) {
            OrderItem oItem = OrderItem.builder()
                    .order(savedOrder)
                    .product(dItem.getProduct())
                    .quantity(dItem.getQuantity())
                    .price(dItem.getPrice())
                    .discount(dItem.getDiscount())
                    .build();
            orderItems.add(oItem);
        }

        savedOrder.setItems(orderItems);
        orderRepository.save(savedOrder);

        // 4. Update Stock (Only for linked products)
        for (OrderDraftItem dItem : draft.getItems()) {
            if (dItem.getProduct() != null && dItem.getQuantity() != null) {
                try {
                    productService.decrementStock(dItem.getProduct().getId(), dItem.getQuantity());
                } catch (Exception e) {
                    // Log error or handle stock issues
                }
            }
        }

        // 5. Mark Draft as Confirmed
        draft.setStatus("CONFIRMED");
        orderDraftRepository.save(draft);

        // 6. Sync and Notify (Safe Calls)
        try {
            tallyIntegrationService.syncOrderToTally(savedOrder);
        } catch (Exception ignore) {
        }
        try {
            whatsAppService.sendOrderConfirmation(savedOrder);
        } catch (Exception ignore) {
        }

        return savedOrder;
    }

    @Transactional
    public void deleteDraft(Long id) {
        OrderDraft draft = orderDraftRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Draft not found"));
        orderDraftRepository.delete(draft);
    }

    public List<OrderDraft> getAllDrafts() {
        return orderDraftRepository.findAll();
    }

    public com.example.sanitary.ware.backend.dto.TourDashboardDTO getTourStats() {
        List<OrderDraft> drafts = orderDraftRepository.findAll();
        long total = drafts.size();
        long confirmed = drafts.stream().filter(d -> "CONFIRMED".equals(d.getStatus())).count();
        long pending = total - confirmed;
        double totalValue = drafts.stream().mapToDouble(d -> d.getTotalAmount() != null ? d.getTotalAmount() : 0.0)
                .sum();
        double confirmedValue = drafts.stream()
                .filter(d -> "CONFIRMED".equals(d.getStatus()))
                .mapToDouble(d -> d.getTotalAmount() != null ? d.getTotalAmount() : 0.0)
                .sum();

        return com.example.sanitary.ware.backend.dto.TourDashboardDTO.builder()
                .totalDrafts(total)
                .confirmedDrafts(confirmed)
                .pendingDrafts(pending)
                .totalDraftValue(totalValue)
                .confirmedValue(confirmedValue)
                .build();
    }

    public OrderDraft getDraft(Long id) {
        return orderDraftRepository.findById(id).orElseThrow();
    }
}
