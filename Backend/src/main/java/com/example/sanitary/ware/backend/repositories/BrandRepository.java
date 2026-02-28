package com.example.sanitary.ware.backend.repositories;

import com.example.sanitary.ware.backend.entities.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface BrandRepository extends JpaRepository<Brand, Long> {
    Optional<Brand> findByCode(String code);

    Optional<Brand> findByName(String name);

    Optional<Brand> findByNameIgnoreCase(String name);
}
