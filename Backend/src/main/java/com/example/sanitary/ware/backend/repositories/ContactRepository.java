package com.example.sanitary.ware.backend.repositories;

import com.example.sanitary.ware.backend.entities.ContactMessage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactRepository extends JpaRepository<ContactMessage, Long> {
}
