package com.example.sanitary.ware.backend.services;

import com.example.sanitary.ware.backend.dto.OrderRequest;
import com.example.sanitary.ware.backend.entities.*;
import com.example.sanitary.ware.backend.enums.OrderStatus;
import com.example.sanitary.ware.backend.enums.PaymentStatus;
import com.example.sanitary.ware.backend.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@lombok.Getter
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final ActivityLogService activityLogService;
    private final TallyIntegrationService tallyIntegrationService;
    private final ProductService productService;
    private final WhatsAppService whatsAppService;
    private final OrderNoteRepository orderNoteRepository;

    @Transactional
    public Order createOrder(Long userId, OrderRequest request) {
        // Call the transactional part
        Order savedOrder = createOrderInternal(userId, request);

        // Automatically sync to Tally if enabled (OUTSIDE transaction)
        try {
            tallyIntegrationService.syncOrderToTally(savedOrder);
        } catch (Exception e) {
            // Log error but don't fail the order creation
            activityLogService.log(userId, savedOrder.getUser().getEmail(), "TALLY_SYNC_FAILED", "ORDERS",
                    "Failed to sync order " + savedOrder.getOrderNumber() + " to Tally: " + e.getMessage());
        }

        // Send WhatsApp Confirmation (Async/Safe)
        try {
            whatsAppService.sendOrderConfirmation(savedOrder);
        } catch (Exception e) {
            // Log but don't fail
            activityLogService.log(userId, savedOrder.getUser().getEmail(), "WHATSAPP_SEND_FAILED", "ORDERS",
                    "Failed to send WhatsApp confirmation: " + e.getMessage());
        }

        return savedOrder;
    }

    @Transactional
    public Order createOrderInternal(Long userId, OrderRequest request) {
        List<CartItem> cartItems = cartRepository.findByUserId(userId);
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        Address address = addressRepository.findById(request.getAddressId()).orElseThrow();
        User user = userRepository.findById(userId).orElseThrow();

        Double totalAmount = cartItems.stream()
                .mapToDouble(item -> item.getProduct().getPrice() * item.getQuantity())
                .sum();

        Order order = Order.builder()
                .orderNumber("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .user(user)
                .totalAmount(totalAmount)
                .status(OrderStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .paymentMethod(request.getPaymentMethod())
                .shippingAddress(address)
                .build();

        Order savedOrder = orderRepository.save(order);

        List<OrderItem> orderItems = cartItems.stream()
                .map(cartItem -> OrderItem.builder()
                        .order(savedOrder)
                        .product(cartItem.getProduct())
                        .quantity(cartItem.getQuantity())
                        .price(cartItem.getProduct().getPrice())
                        .build())
                .collect(Collectors.toList());

        savedOrder.setItems(orderItems);
        orderRepository.save(savedOrder);

        // Add history
        addStatusHistory(savedOrder, OrderStatus.PENDING, "Order placed successfully");

        // Decrement stock for each product
        for (CartItem cartItem : cartItems) {
            try {
                productService.decrementStock(cartItem.getProduct().getId(), cartItem.getQuantity());
            } catch (Exception e) {
                activityLogService.log(userId, user.getEmail(), "STOCK_UPDATE_FAILED", "ORDERS",
                        "Failed to update stock for " + cartItem.getProduct().getName() + ": " + e.getMessage());
            }
        }

        // Clear cart
        cartRepository.deleteByUserId(userId);

        // Activity log
        activityLogService.log(userId, user.getEmail(), "PLACE_ORDER", "ORDERS",
                "Placed order: " + savedOrder.getOrderNumber());

        return savedOrder;
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id).orElseThrow();
    }

    public List<Order> getCustomerOrders(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Transactional
    public Order updateOrderStatus(Long id, OrderStatus status) {
        Order order = getOrderById(id);
        order.setStatus(status);
        Order savedOrder = orderRepository.save(order);
        addStatusHistory(savedOrder, status, "Order status updated to " + status);
        activityLogService.log(1L, "admin@example.com", "UPDATE_ORDER_STATUS", "ORDERS",
                "Updated " + savedOrder.getOrderNumber() + " to " + status);
        return savedOrder;
    }

    @Transactional
    public void cancelOrder(Long userId, Long orderId) {
        Order order = getOrderById(orderId);
        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        order.setStatus(OrderStatus.CANCELLED);
        Order savedOrder = orderRepository.save(order);
        addStatusHistory(savedOrder, OrderStatus.CANCELLED, "Order cancelled by customer");
        activityLogService.log(userId, order.getUser().getEmail(), "CANCEL_ORDER", "ORDERS",
                "Cancelled order: " + savedOrder.getOrderNumber());
    }

    public List<OrderStatusHistory> getOrderTimeline(Long orderId) {
        return orderStatusHistoryRepository.findByOrderIdOrderByCreatedAtDesc(orderId);
    }

    @Transactional
    public void deleteOrder(Long id) {
        Order order = getOrderById(id);
        orderRepository.delete(order);
        activityLogService.log(1L, "admin@example.com", "DELETE_ORDER", "ORDERS",
                "Deleted order: " + order.getOrderNumber());
    }

    @Transactional
    public OrderNote addNote(Long orderId, String noteText, String addedBy) {
        Order order = getOrderById(orderId);
        OrderNote note = OrderNote.builder()
                .order(order)
                .note(noteText)
                .addedBy(addedBy)
                .build();
        return orderNoteRepository.save(note);
    }

    public List<OrderNote> getOrderNotes(Long orderId) {
        return orderNoteRepository.findByOrderIdOrderByCreatedAtDesc(orderId);
    }

    private void addStatusHistory(Order order, OrderStatus status, String comment) {
        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(order)
                .status(status)
                .comment(comment)
                .build();
        orderStatusHistoryRepository.save(history);
    }
}
