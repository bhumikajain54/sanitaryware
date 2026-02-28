package com.example.sanitary.ware.backend.repositories;

import com.example.sanitary.ware.backend.entities.CMSPage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CMSPageRepository extends JpaRepository<CMSPage, Long> {
    Optional<CMSPage> findBySlug(String slug);
}
