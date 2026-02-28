package com.example.sanitary.ware.backend.services;

import com.example.sanitary.ware.backend.config.RazorpayConfig;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class RazorpayService {

    private final RazorpayConfig razorpayConfig;
    private RazorpayClient razorpayClient;

    @PostConstruct
    public void init() {
        try {
            String keyId = razorpayConfig.getKeyId() != null ? razorpayConfig.getKeyId().trim() : null;
            String keySecret = razorpayConfig.getKeySecret() != null ? razorpayConfig.getKeySecret().trim() : null;

            if (keyId == null || keySecret == null || keyId.isEmpty() || keySecret.isEmpty()) {
                log.error("Razorpay keys are missing or empty in configuration. key-id: {}, has-secret: {}",
                        keyId, keySecret != null);
                return;
            }
            this.razorpayClient = new RazorpayClient(keyId, keySecret);
            log.info("Razorpay Client initialized successfully with Key ID: {}", keyId);
        } catch (Exception e) {
            log.error("Failed to initialize Razorpay Client: {}", e.getMessage(), e);
        }
    }

    public Order createOrder(double amount, String receiptId) throws RazorpayException {
        if (razorpayClient == null) {
            throw new RazorpayException("Razorpay client not initialized. Check configuration.");
        }

        JSONObject orderRequest = new JSONObject();
        // Razorpay expects amount in paise (multiply by 100)
        orderRequest.put("amount", (int) (amount * 100));
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", receiptId);

        return razorpayClient.orders.create(orderRequest);
    }

    public boolean verifySignature(String orderId, String paymentId, String signature) throws RazorpayException {
        JSONObject options = new JSONObject();
        options.put("razorpay_order_id", orderId);
        options.put("razorpay_payment_id", paymentId);
        options.put("razorpay_signature", signature);

        return Utils.verifyPaymentSignature(options, razorpayConfig.getKeySecret());
    }

    public String getKeyId() {
        return razorpayConfig.getKeyId();
    }
}
