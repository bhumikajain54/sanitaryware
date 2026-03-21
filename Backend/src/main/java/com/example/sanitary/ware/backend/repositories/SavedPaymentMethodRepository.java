package com.example.sanitary.ware.backend.repositories;

import com.example.sanitary.ware.backend.entities.SavedPaymentMethod;
import com.example.sanitary.ware.backend.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SavedPaymentMethodRepository extends JpaRepository<SavedPaymentMethod, Long> {
    List<SavedPaymentMethod> findByUserAndType(User user, String type);
    Optional<SavedPaymentMethod> findByIdAndUser(Long id, User user);
}
