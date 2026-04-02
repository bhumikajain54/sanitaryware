package com.example.sanitary.ware.backend.repositories;

import com.example.sanitary.ware.backend.entities.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface BrandRepository extends JpaRepository<Brand, Long> {
    Optional<Brand> findByCode(String code);

    Optional<Brand> findByName(String name);

    @org.springframework.data.jpa.repository.Query("SELECT b FROM Brand b WHERE TRIM(LOWER(b.name)) = TRIM(LOWER(:name))")
    Optional<Brand> findByNameIgnoreCase(@org.springframework.data.repository.query.Param("name") String name);
}
