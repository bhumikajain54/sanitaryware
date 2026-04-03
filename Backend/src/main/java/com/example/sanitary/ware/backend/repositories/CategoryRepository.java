package com.example.sanitary.ware.backend.repositories;

import com.example.sanitary.ware.backend.entities.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    java.util.Optional<Category> findByName(String name);
}
