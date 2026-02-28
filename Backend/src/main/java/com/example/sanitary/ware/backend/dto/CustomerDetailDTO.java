package com.example.sanitary.ware.backend.dto;

import com.example.sanitary.ware.backend.entities.Address;
import com.example.sanitary.ware.backend.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerDetailDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private Role role;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Order-related fields
    private Long orderCount;
    private Double totalSpent;
    private LocalDateTime lastOrderDate;

    // Address information
    private List<Address> addresses;
    private Integer addressCount;
}
