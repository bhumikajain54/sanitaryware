package com.example.sanitary.ware.backend.repositories;

import com.example.sanitary.ware.backend.entities.OrderNote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderNoteRepository extends JpaRepository<OrderNote, Long> {
    List<OrderNote> findByOrderIdOrderByCreatedAtDesc(Long orderId);
}
