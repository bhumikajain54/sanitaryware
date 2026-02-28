package com.example.sanitary.ware.backend.controllers;

import com.example.sanitary.ware.backend.entities.ContactMessage;
import com.example.sanitary.ware.backend.repositories.ContactRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
public class ContactController {

    private final ContactRepository contactRepository;

    @PostMapping
    public ResponseEntity<ContactMessage> submitContactForm(@RequestBody @NonNull ContactMessage message) {
        return ResponseEntity.ok(contactRepository.save(message));
    }

    @GetMapping("/admin/contact-messages")
    public ResponseEntity<List<ContactMessage>> getAllMessages() {
        return ResponseEntity.ok(contactRepository.findAll());
    }

    @PutMapping("/admin/contact-messages/{id}/read")
    public ResponseEntity<ContactMessage> markAsRead(@PathVariable @NonNull Long id) {
        ContactMessage message = contactRepository.findById(id).orElseThrow();
        message.setRead(true);
        return ResponseEntity.ok(contactRepository.save(message));
    }
}
