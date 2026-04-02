package com.example.sanitary.ware.backend.repositories;

import com.example.sanitary.ware.backend.entities.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    java.util.Optional<Category> findByName(String name);
    
    @org.springframework.data.jpa.repository.Query("SELECT c FROM Category c WHERE TRIM(LOWER(c.name)) = TRIM(LOWER(:name))")
    java.util.Optional<Category> findByNameIgnoreCase(@org.springframework.data.repository.query.Param("name") String name);
}
