package com.example.sanitary.ware.backend.controllers;

import com.example.sanitary.ware.backend.dto.OrderDraftRequest;
import com.example.sanitary.ware.backend.entities.Order;
import com.example.sanitary.ware.backend.entities.OrderDraft;
import com.example.sanitary.ware.backend.services.OrderDraftService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/order-drafts")
@RequiredArgsConstructor
public class AdminOrderDraftController {

    private final OrderDraftService orderDraftService;

    @PostMapping
    public ResponseEntity<OrderDraft> createDraft(@RequestBody OrderDraftRequest request) {
        return ResponseEntity.ok(orderDraftService.createDraft(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrderDraft> updateDraft(@PathVariable Long id, @RequestBody OrderDraftRequest request) {
        return ResponseEntity.ok(orderDraftService.updateDraft(id, request));
    }

    @GetMapping
    public ResponseEntity<List<OrderDraft>> getAllDrafts() {
        return ResponseEntity.ok(orderDraftService.getAllDrafts());
    }

    @GetMapping("/stats")
    public ResponseEntity<com.example.sanitary.ware.backend.dto.TourDashboardDTO> getTourStats() {
        return ResponseEntity.ok(orderDraftService.getTourStats());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDraft> getDraftById(@PathVariable Long id) {
        return ResponseEntity.ok(orderDraftService.getDraft(id));
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<Order> confirmOrder(@PathVariable Long id, @RequestParam(required = false) Long adminId) {
        return ResponseEntity.ok(orderDraftService.convertToOrder(id, adminId != null ? adminId : 0L));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDraft(@PathVariable Long id) {
        orderDraftService.deleteDraft(id);
        return ResponseEntity.ok().build();
    }
}
