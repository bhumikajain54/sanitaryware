package com.example.sanitary.ware.backend.controllers;

import com.example.sanitary.ware.backend.services.WhatsAppService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/whatsapp")
@RequiredArgsConstructor
@Slf4j
public class WhatsAppWebhookController {

    @Value("${whatsapp.webhook.verify-token:sanitary_ware_token}")
    private String verifyToken;

    private final WhatsAppService whatsAppService;

    /**
     * Webhook Verification (Required by Meta)
     */
    @GetMapping("/webhook")
    public ResponseEntity<String> verifyWebhook(
            @RequestParam("hub.mode") String mode,
            @RequestParam("hub.verify_token") String token,
            @RequestParam("hub.challenge") String challenge) {

        if ("subscribe".equals(mode) && verifyToken.equals(token)) {
            log.info("WhatsApp Webhook verified successfully!");
            return ResponseEntity.ok(challenge);
        } else {
            log.error("WhatsApp Webhook verification failed. Token: {}", token);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    /**
     * Receive Incoming Messages
     */
    @PostMapping("/webhook")
    public ResponseEntity<Void> receiveMessage(@RequestBody String payload) {
        log.info("Received WhatsApp Payload: {}", payload);

        try {
            JSONObject json = new JSONObject(payload);
            if (json.has("entry")) {
                JSONArray entry = json.getJSONArray("entry");
                for (int i = 0; i < entry.length(); i++) {
                    JSONObject change = entry.getJSONObject(i).getJSONArray("changes").getJSONObject(0)
                            .getJSONObject("value");

                    if (change.has("messages")) {
                        JSONArray messages = change.getJSONArray("messages");
                        for (int j = 0; j < messages.length(); j++) {
                            JSONObject msg = messages.getJSONObject(j);
                            String from = msg.getString("from");

                            // Simple Auto-Reply for Support
                            whatsAppService.sendTextMessage(from,
                                    "Hello! We have received your message. Our support team will contact you shortly.");
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error parsing WhatsApp webhook: {}", e.getMessage());
        }

        return ResponseEntity.ok().build();
    }
}
