package com.example.sanitary.ware.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerResponseDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private int orderCount;
    private Double totalSpent;
    private boolean active;
    private LocalDateTime joinedDate;
    private String avatar; // For the profile image shown in the image
}
