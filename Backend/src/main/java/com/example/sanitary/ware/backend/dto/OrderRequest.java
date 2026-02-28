package com.example.sanitary.ware.backend.dto;

import lombok.Data;

@Data
public class OrderRequest {
    private Long addressId;
    private String paymentMethod;
}
