package com.example.sanitary.ware.backend.controllers;

import com.example.sanitary.ware.backend.dto.CustomerDetailDTO;
import com.example.sanitary.ware.backend.entities.User;
import com.example.sanitary.ware.backend.enums.Role;
import com.example.sanitary.ware.backend.repositories.UserRepository;
import com.example.sanitary.ware.backend.services.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminCustomerController {

    private final UserRepository userRepository;
    private final CustomerService customerService;

    @GetMapping
    public ResponseEntity<List<CustomerDetailDTO>> getAllCustomers() {
        List<User> users = userRepository.findByRole(Role.CUSTOMER);
        List<CustomerDetailDTO> customerDetails = users.stream()
                .map(user -> customerService.getCustomerDetails(user.getId()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(customerDetails);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerDetailDTO> getCustomerById(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getCustomerDetails(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<User> updateCustomerStatus(@PathVariable Long id, @RequestParam boolean active) {
        User user = userRepository.findById(id).orElseThrow();
        user.setActive(active);
        return ResponseEntity.ok(userRepository.save(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateCustomer(@PathVariable Long id, @RequestBody User userDetails) {
        User user = userRepository.findById(id).orElseThrow();
        if (userDetails.getFirstName() != null) {
            user.setFirstName(userDetails.getFirstName());
        }
        if (userDetails.getLastName() != null) {
            user.setLastName(userDetails.getLastName());
        }
        if (userDetails.getPhone() != null) {
            user.setPhone(userDetails.getPhone());
        }
        return ResponseEntity.ok(userRepository.save(user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

}
