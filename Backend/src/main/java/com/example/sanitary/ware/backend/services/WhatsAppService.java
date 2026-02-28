package com.example.sanitary.ware.backend.services;

import com.example.sanitary.ware.backend.entities.Order;
import com.example.sanitary.ware.backend.entities.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class WhatsAppService {

    @Value("${whatsapp.api.url:https://graph.facebook.com/v17.0/}")
    private String apiUrl;

    @Value("${whatsapp.phone.number.id}")
    private String phoneNumberId;

    @Value("${whatsapp.access.token}")
    private String accessToken;

    @Value("${whatsapp.business.account.id:}")
    private String businessAccountId;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Send a standard template message (e.g., for OTP, Orders)
     */
    public void sendTemplateMessage(String to, String templateName, String languageCode, List<String> bodyParams) {
        try {
            String url = apiUrl + phoneNumberId + "/messages";

            JSONObject requestBody = new JSONObject();
            requestBody.put("messaging_product", "whatsapp");
            requestBody.put("to", formatPhoneNumber(to));
            requestBody.put("type", "template");

            JSONObject template = new JSONObject();
            template.put("name", templateName);

            JSONObject language = new JSONObject();
            language.put("code", languageCode);
            template.put("language", language);

            if (bodyParams != null && !bodyParams.isEmpty()) {
                JSONArray components = new JSONArray();
                JSONObject bodyComponent = new JSONObject();
                bodyComponent.put("type", "body");

                JSONArray parameters = new JSONArray();
                for (String param : bodyParams) {
                    JSONObject parameter = new JSONObject();
                    parameter.put("type", "text");
                    parameter.put("text", param);
                    parameters.put(parameter);
                }
                bodyComponent.put("parameters", parameters);
                components.put(bodyComponent);
                template.put("components", components);
            }

            requestBody.put("template", template);

            sendRequest(url, requestBody.toString());

        } catch (Exception e) {
            log.error("Error sending WhatsApp template message: {}", e.getMessage());
        }
    }

    /**
     * Send a free-form text message (Customer Support)
     * Note: Can only be sent within 24 hours of a user-initiated message.
     */
    public void sendTextMessage(String to, String message) {
        try {
            String url = apiUrl + phoneNumberId + "/messages";

            JSONObject requestBody = new JSONObject();
            requestBody.put("messaging_product", "whatsapp");
            requestBody.put("recipient_type", "individual");
            requestBody.put("to", formatPhoneNumber(to));
            requestBody.put("type", "text");

            JSONObject textObj = new JSONObject();
            textObj.put("preview_url", false);
            textObj.put("body", message);

            requestBody.put("text", textObj);

            sendRequest(url, requestBody.toString());

        } catch (Exception e) {
            log.error("Error sending WhatsApp text message: {}", e.getMessage());
        }
    }

    /**
     * Send Order Confirmation automatically
     */
    public void sendOrderConfirmation(Order order) {
        try {
            User user = order.getUser();
            if (user == null || user.getPhone() == null || user.getPhone().isEmpty()) {
                log.warn("Cannot send WhatsApp order confirmation: User phone number missing for Order ID {}",
                        order.getId());
                return;
            }

            String customerName = user.getFirstName();
            String orderNumber = order.getOrderNumber();
            String amount = String.format("%.2f", order.getTotalAmount());
            int itemCount = order.getItems() != null ? order.getItems().size() : 0;

            sendTemplateMessage(
                    user.getPhone(),
                    "order_confirmation",
                    "en_US",
                    List.of(customerName, orderNumber, amount, String.valueOf(itemCount)));

            log.info("WhatsApp order confirmation sent for order {}", orderNumber);

        } catch (Exception e) {
            log.error("Failed to send WhatsApp order confirmation: {}", e.getMessage());
        }
    }

    /**
     * Send Invoice Confirmation
     */
    public void sendInvoiceConfirmation(com.example.sanitary.ware.backend.entities.Invoice invoice) {
        try {
            Order order = invoice.getOrder();
            User user = order.getUser();
            if (user == null || user.getPhone() == null || user.getPhone().isEmpty()) {
                return;
            }

            String message = "*Invoice Generated: " + invoice.getInvoiceNumber() + "*\n\n" +
                    "Hello " + user.getFirstName() + ",\n" +
                    "Your invoice for Order #" + order.getOrderNumber() + " has been generated.\n" +
                    "*Total Amount: " + String.format("%.2f", invoice.getTotalAmount()) + "*\n\n" +
                    "Thank you for business!";

            sendTextMessage(user.getPhone(), message);
            log.info("WhatsApp invoice notification sent for invoice {}", invoice.getInvoiceNumber());

        } catch (Exception e) {
            log.error("Failed to send WhatsApp invoice confirmation: {}", e.getMessage());
        }
    }

    /**
     * Send OTP
     */
    public void sendOtp(String to, String otp) {
        // Template Name: 'auth_otp' - User needs to create this
        // Expected Param: 1. OTP Code
        sendTemplateMessage(to, "auth_otp", "en_US", List.of(otp));
    }

    private void sendRequest(String url, String jsonBody) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);

        HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);

        try {
            String response = restTemplate.postForObject(url, entity, String.class);
            log.debug("WhatsApp API Response: {}", response);
        } catch (Exception e) {
            log.error("WhatsApp API Request Failed: {}", e.getMessage());
            throw e;
        }
    }

    private String formatPhoneNumber(String phone) {
        // Basic normalization: remove spaces, ensured country code if missing (assuming
        // 91 for India if not present)
        // Ideally, phone should strictly be in E.164 format
        String cleanPhone = phone.replaceAll("[^0-9]", "");
        if (cleanPhone.length() == 10) {
            return "91" + cleanPhone; // Default to India if only 10 digits
        }
        return cleanPhone;
    }
}
