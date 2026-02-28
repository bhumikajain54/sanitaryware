package com.example.sanitary.ware.backend.dto;

import com.example.sanitary.ware.backend.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private Long id;
    private String token;
    private String email;
    private Role role;
    private String firstName;
    private String lastName;
}
