package com.example.sanitary.ware.backend.controllers;

import com.example.sanitary.ware.backend.entities.Address;
import com.example.sanitary.ware.backend.entities.User;
import com.example.sanitary.ware.backend.services.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final CustomerService customerService;

    @GetMapping
    public ResponseEntity<List<Address>> getAddresses(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(customerService.getAddresses(user.getId()));
    }

    @PostMapping
    public ResponseEntity<Address> addAddress(@AuthenticationPrincipal User user, @RequestBody Address address) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(customerService.addAddress(user.getId(), address));
    }

    @PutMapping("/{id:[0-9]+}")
    public ResponseEntity<Address> updateAddress(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestBody Address address) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(customerService.updateAddress(user.getId(), id, address));
    }

    @DeleteMapping("/{id:[0-9]+}")
    public ResponseEntity<Void> deleteAddress(@AuthenticationPrincipal User user, @PathVariable Long id) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        customerService.deleteAddress(user.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @RequestMapping(value = "/{id:[0-9]+}/set-default", method = {RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<Void> setDefaultAddress(@AuthenticationPrincipal User user, @PathVariable Long id) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        customerService.setDefaultAddress(user.getId(), id);
        return ResponseEntity.ok().build();
    }
}
