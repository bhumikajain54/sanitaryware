package com.example.sanitary.ware.backend.repositories;

import com.example.sanitary.ware.backend.entities.Invoice;
import com.example.sanitary.ware.backend.entities.Order;
import com.example.sanitary.ware.backend.enums.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    Optional<Invoice> findByOrder(Order order);

    List<Invoice> findByStatus(InvoiceStatus status);

    List<Invoice> findBySyncedToTally(Boolean synced);

    List<Invoice> findByInvoiceDateBetween(LocalDate startDate, LocalDate endDate);

    List<Invoice> findByDueDateBeforeAndStatusNot(LocalDate date, InvoiceStatus status);

    Long countByStatus(InvoiceStatus status);
}
