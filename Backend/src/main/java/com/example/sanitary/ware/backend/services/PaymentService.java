package com.example.sanitary.ware.backend.services;

import com.example.sanitary.ware.backend.dto.PaymentRequest;
import com.example.sanitary.ware.backend.dto.RazorpayVerificationRequest;
import com.example.sanitary.ware.backend.entities.Order;
import com.example.sanitary.ware.backend.entities.Payment;
import com.example.sanitary.ware.backend.enums.PaymentStatus;
import com.example.sanitary.ware.backend.repositories.OrderRepository;
import com.example.sanitary.ware.backend.repositories.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final RazorpayService razorpayService;

    public Map<String, Object> initiatePayment(PaymentRequest request) {
        String paymentMethod = request.getPaymentMethod();

        // Resolve Order (Find by ID or Order Number)
        Optional<Order> orderOpt = findOrder(request.getOrderId());
        if (orderOpt.isEmpty()) {
            return Map.of("status", "FAILED", "message", "Order not found with ID: " + request.getOrderId());
        }
        Order order = orderOpt.get();

        // Prevent double payment
        if (order.getPaymentStatus() == PaymentStatus.COMPLETED) {
            return Map.of(
                    "status", "FAILED",
                    "message", "Payment for this order has already been completed.",
                    "orderId", order.getId());
        }

        // Handle Cash on Delivery
        if ("COD".equalsIgnoreCase(paymentMethod) || "CASH_ON_DELIVERY".equalsIgnoreCase(paymentMethod)) {
            return processCodPayment(order, request.getAmount());
        }

        // Handle Razorpay
        try {
            String receiptId = "txn_" + order.getOrderNumber();
            com.razorpay.Order razorpayOrder = razorpayService.createOrder(request.getAmount(), receiptId);
            String razorpayOrderId = razorpayOrder.get("id");

            saveRazorpayPaymentDetails(order.getId(), razorpayOrderId, request.getAmount());

            // Update Order with the Razorpay ID
            order.setPaymentId(razorpayOrderId);
            order.setPaymentMethod(paymentMethod != null ? paymentMethod : "RAZORPAY");
            orderRepository.save(order);

            return Map.of(
                    "transactionId", razorpayOrderId,
                    "razorpayOrderId", razorpayOrderId,
                    "status", "CREATED",
                    "paymentMethod", "RAZORPAY",
                    "key", razorpayService.getKeyId(),
                    "amount", razorpayOrder.get("amount"),
                    "currency", razorpayOrder.get("currency"),
                    "orderId", order.getId());

        } catch (Exception e) {
            log.error("Error initiating Razorpay payment for order: {}. Error: {}", request.getOrderId(),
                    e.getMessage(), e);
            return Map.of(
                    "status", "FAILED",
                    "message", "Error initiating Razorpay: " + e.getMessage());
        }
    }

    @Transactional
    public Map<String, Object> processCodPayment(Order order, Double amount) {
        String transactionId = "COD_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // Check if a payment record already exists for this order
        Payment payment = paymentRepository.findFirstByOrderIdAndStatusOrderByCreatedAtDesc(order.getId(), null)
                .orElse(new Payment());

        payment.setOrder(order);
        payment.setUser(order.getUser());
        payment.setAmount(amount);
        payment.setPaymentMethod("COD");
        payment.setStatus(PaymentStatus.PENDING);
        payment.setTransactionId(transactionId);

        paymentRepository.save(payment);

        // Update Order
        order.setPaymentId(transactionId);
        order.setPaymentStatus(PaymentStatus.PENDING);
        orderRepository.save(order);

        return Map.of(
                "transactionId", transactionId,
                "status", "SUCCESS",
                "paymentMethod", "CASH_ON_DELIVERY",
                "orderId", order.getId(),
                "message", "Order placed with Cash on Delivery");
    }

    @Transactional
    public void saveRazorpayPaymentDetails(Long orderId, String razorpayOrderId, Double amount) {
        Order order = orderRepository.findById(orderId).orElseThrow();

        // Reuse existing payment record or create new
        Payment payment = paymentRepository.findFirstByOrderIdAndStatusOrderByCreatedAtDesc(order.getId(), null)
                .orElse(new Payment());

        payment.setOrder(order);
        payment.setUser(order.getUser());
        payment.setAmount(amount);
        payment.setCurrency("INR");
        payment.setPaymentMethod("RAZORPAY");
        payment.setStatus(PaymentStatus.PENDING);
        payment.setTransactionId(razorpayOrderId);
        payment.setRazorpayOrderId(razorpayOrderId);
        payment.setReceipt("txn_" + order.getOrderNumber());

        paymentRepository.save(payment);

        // Link to Order
        order.setPaymentId(razorpayOrderId);
        orderRepository.save(order);
    }

    @Transactional
    public Map<String, Object> verifyRazorpayPayment(RazorpayVerificationRequest request) {
        Long internalOrderId = request.getEffectiveOrderId();
        log.info("Verifying Razorpay payment for internal order ID: {}, Razorpay Order ID: {}",
                internalOrderId, request.getRazorpayOrderId());
        try {
            boolean isValid = razorpayService.verifySignature(
                    request.getRazorpayOrderId(),
                    request.getRazorpayPaymentId(),
                    request.getRazorpaySignature());

            if (isValid) {
                log.info("Payment signature verified successfully for order: {}", internalOrderId);
                updateOrderAndPaymentExtended(internalOrderId, request.getRazorpayOrderId(),
                        request.getRazorpayPaymentId(), PaymentStatus.COMPLETED, request.getRazorpaySignature());
                return Map.of("status", "SUCCESS", "message", "Payment verified successfully");
            } else {
                log.warn("Invalid payment signature for order: {}. Razorpay Order ID: {}, Payment ID: {}",
                        internalOrderId, request.getRazorpayOrderId(), request.getRazorpayPaymentId());
                updateOrderAndPaymentExtended(internalOrderId, request.getRazorpayOrderId(),
                        request.getRazorpayPaymentId(), PaymentStatus.FAILED, request.getRazorpaySignature());
                return Map.of("status", "FAILED", "message", "Invalid signature");
            }
        } catch (Exception e) {
            log.error("Verification error for order {}: {}", internalOrderId, e.getMessage(), e);
            return Map.of("status", "FAILED", "message", "Verification error: " + e.getMessage());
        }
    }

    @Transactional
    public Map<String, Object> updateOrderPaymentStatus(Long orderId, String transactionId, String status,
            String errorCode, String errorDesc) {
        PaymentStatus paymentStatus = ("SUCCESS".equalsIgnoreCase(status) || "COMPLETED".equalsIgnoreCase(status))
                ? PaymentStatus.COMPLETED
                : PaymentStatus.FAILED;

        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isEmpty())
            return Map.of("success", false, "message", "Order not found");

        Order order = orderOpt.get();
        // Update Order
        order.setPaymentStatus(paymentStatus);
        if (transactionId != null && !transactionId.isEmpty()) {
            order.setPaymentId(transactionId);
        }
        orderRepository.save(order);

        // Update Payment record - Try to find existing first
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseGet(() -> paymentRepository.findFirstByOrderIdAndStatusOrderByCreatedAtDesc(orderId, null)
                        .orElse(new Payment()));

        payment.setOrder(order);
        payment.setUser(order.getUser());
        payment.setAmount(order.getTotalAmount());
        payment.setCurrency("INR");
        payment.setPaymentMethod(order.getPaymentMethod() != null ? order.getPaymentMethod() : "ONLINE");
        payment.setTransactionId(transactionId);
        payment.setStatus(paymentStatus);
        payment.setErrorCode(errorCode);
        payment.setErrorDescription(errorDesc);

        paymentRepository.save(payment);

        return Map.of(
                "success", true,
                "orderId", orderId,
                "status", status);
    }

    private boolean updateOrderAndPaymentExtended(Long orderId, String razorpayOrderId, String razorpayPaymentId,
            PaymentStatus status, String signature) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isEmpty())
            return false;

        Order order = orderOpt.get();

        // Find existing payment record using Razorpay Order ID (which was saved as
        // transactionId initially)
        Optional<Payment> paymentOpt = paymentRepository.findByTransactionId(razorpayOrderId);

        // Fallback: search by Order ID and PENDING status
        if (paymentOpt.isEmpty()) {
            paymentOpt = paymentRepository.findFirstByOrderIdAndStatusOrderByCreatedAtDesc(orderId,
                    PaymentStatus.PENDING);
        }

        if (paymentOpt.isPresent()) {
            Payment payment = paymentOpt.get();
            payment.setStatus(status);
            payment.setRazorpayPaymentId(razorpayPaymentId);
            payment.setRazorpaySignature(signature);
            // Update transactionId to the actual payment ID after verification
            payment.setTransactionId(razorpayPaymentId);
            paymentRepository.save(payment);

            // Link back to order
            order.setPaymentId(razorpayPaymentId);
        } else {
            // Create record if missing
            Payment payment = Payment.builder()
                    .order(order)
                    .user(order.getUser())
                    .amount(order.getTotalAmount())
                    .paymentMethod(order.getPaymentMethod())
                    .status(status)
                    .transactionId(razorpayPaymentId)
                    .razorpayOrderId(razorpayOrderId)
                    .razorpayPaymentId(razorpayPaymentId)
                    .razorpaySignature(signature)
                    .build();
            paymentRepository.save(payment);
            order.setPaymentId(razorpayPaymentId);
        }

        order.setPaymentStatus(status);
        orderRepository.save(order);

        return true;
    }

    private Optional<Order> findOrder(String orderIdStr) {
        if (orderIdStr == null)
            return Optional.empty();
        if (orderIdStr.startsWith("ORD-")) {
            return orderRepository.findByOrderNumber(orderIdStr);
        } else {
            try {
                return orderRepository.findById(Long.parseLong(orderIdStr));
            } catch (NumberFormatException e) {
                return orderRepository.findByOrderNumber(orderIdStr);
            }
        }
    }

    public Map<String, Object> verifyPayment(String transactionId) {
        // Simple verification based on existing records
        Optional<Payment> payment = paymentRepository.findByTransactionId(transactionId);
        if (payment.isPresent()) {
            return Map.of("status", payment.get().getStatus().toString(), "message", "Payment found");
        }
        return Map.of("status", "NOT_FOUND", "message", "Transaction not found");
    }

    public List<Map<String, Object>> getPaymentHistory() {
        return paymentRepository.findAll().stream()
                .map(p -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", p.getId());
                    map.put("amount", p.getAmount());
                    map.put("currency", p.getCurrency());
                    map.put("status", p.getStatus());
                    map.put("paymentMethod", p.getPaymentMethod());
                    map.put("transactionId", p.getTransactionId());
                    map.put("razorpayOrderId", p.getRazorpayOrderId());
                    map.put("razorpayPaymentId", p.getRazorpayPaymentId());
                    map.put("receipt", p.getReceipt());
                    map.put("errorCode", p.getErrorCode());
                    map.put("errorDescription", p.getErrorDescription());
                    map.put("createdAt", p.getCreatedAt());
                    map.put("updatedAt", p.getUpdatedAt());
                    map.put("orderId", p.getOrder() != null ? p.getOrder().getId() : null);
                    map.put("orderNumber", p.getOrder() != null ? p.getOrder().getOrderNumber() : null);
                    map.put("userName",
                            p.getUser() != null ? p.getUser().getFirstName() + " " + p.getUser().getLastName()
                                    : "Unknown");
                    return map;
                })
                .sorted((a, b) -> ((LocalDateTime) b.get("createdAt"))
                        .compareTo((LocalDateTime) a.get("createdAt")))
                .toList();
    }

    public Map<String, Object> getPaymentById(Long id) {
        return paymentRepository.findById(id)
                .map(p -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", p.getId());
                    map.put("amount", p.getAmount());
                    map.put("currency", p.getCurrency());
                    map.put("status", p.getStatus());
                    map.put("paymentMethod", p.getPaymentMethod());
                    map.put("transactionId", p.getTransactionId());
                    map.put("razorpayOrderId", p.getRazorpayOrderId());
                    map.put("razorpayPaymentId", p.getRazorpayPaymentId());
                    map.put("receipt", p.getReceipt());
                    map.put("errorCode", p.getErrorCode());
                    map.put("errorDescription", p.getErrorDescription());
                    map.put("createdAt", p.getCreatedAt());
                    map.put("orderId", p.getOrder() != null ? p.getOrder().getId() : null);
                    map.put("orderNumber", p.getOrder() != null ? p.getOrder().getOrderNumber() : null);
                    return map;
                })
                .orElse(Map.of("status", "NOT_FOUND"));
    }

    public Map<String, Object> getPaymentReport() {
        List<Payment> all = paymentRepository.findAll();
        long totalCount = all.size();
        double totalVolume = all.stream()
                .filter(p -> p.getStatus() == PaymentStatus.COMPLETED)
                .mapToDouble(Payment::getAmount)
                .sum();
        long successCount = all.stream()
                .filter(p -> p.getStatus() == PaymentStatus.COMPLETED)
                .count();

        String successRate = totalCount == 0 ? "0%" : String.format("%.2f%%", (successCount * 100.0 / totalCount));

        Map<String, Object> report = new HashMap<>();
        report.put("totalTransactions", totalCount);
        report.put("totalVolume", totalVolume);
        report.put("successRate", successRate);
        report.put("currency", "INR");

        return report;
    }
}
