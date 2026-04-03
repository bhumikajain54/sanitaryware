package com.example.sanitary.ware.backend.repositories;

import com.example.sanitary.ware.backend.entities.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

        List<Product> findByCategoryId(Long categoryId);

        List<Product> findByBrandId(Long brandId);

        List<Product> findByFeaturedTrue();

        @Query(value = "SELECT p FROM Product p " +
                        "LEFT JOIN FETCH p.brand " +
                        "LEFT JOIN FETCH p.category " +
                        "WHERE (CAST(:query AS text) IS NULL OR LOWER(CAST(p.name AS text)) LIKE LOWER(CONCAT('%', CAST(:query AS text), '%'))) " +
                        "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
                        "AND (:brandId IS NULL OR p.brand.id = :brandId) " +
                        "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
                        "AND (:maxPrice IS NULL OR p.price <= :maxPrice)",
                countQuery = "SELECT count(p) FROM Product p WHERE " +
                        "(CAST(:query AS text) IS NULL OR LOWER(CAST(p.name AS text)) LIKE LOWER(CONCAT('%', CAST(:query AS text), '%'))) " +
                        "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
                        "AND (:brandId IS NULL OR p.brand.id = :brandId) " +
                        "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
                        "AND (:maxPrice IS NULL OR p.price <= :maxPrice)")
        Page<Product> searchProducts(@Param("query") String query,
                        @Param("categoryId") Long categoryId,
                        @Param("brandId") Long brandId,
                        @Param("minPrice") Double minPrice,
                        @Param("maxPrice") Double maxPrice,
                        Pageable pageable);

        @Query("SELECT p FROM Product p LEFT JOIN FETCH p.brand LEFT JOIN FETCH p.category WHERE LOWER(CAST(p.name AS text)) LIKE LOWER(CONCAT('%', CAST(:query AS text), '%'))")
        List<Product> searchByName(@Param("query") String query);

        java.util.Optional<Product> findByName(String name);

        java.util.Optional<Product> findByNameIgnoreCase(String name);

        @Modifying
        @Transactional
        @Query("UPDATE Product p SET p.stockQuantity = :quantity")
        int updateAllStockQuantity(@Param("quantity") Integer quantity);

    long countByStockQuantityLessThan(Integer threshold);
}
