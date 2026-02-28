package com.example.sanitary.ware.backend.repositories;

import com.example.sanitary.ware.backend.entities.Quotation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuotationRepository extends JpaRepository<Quotation, Long> {
}
