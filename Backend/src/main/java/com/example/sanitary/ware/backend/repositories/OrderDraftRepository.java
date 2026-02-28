package com.example.sanitary.ware.backend.repositories;

import com.example.sanitary.ware.backend.entities.OrderDraft;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderDraftRepository extends JpaRepository<OrderDraft, Long> {
    List<OrderDraft> findBySalesPersonName(String salesPersonName);

    List<OrderDraft> findByStatus(String status);
}
