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

        @Query(value = "SELECT * FROM products p WHERE " +
                        "(CAST(:query AS text) IS NULL OR CAST(p.name AS text) ILIKE '%' || CAST(:query AS text) || '%') " +
                        "AND (CAST(:categoryId AS bigint) IS NULL OR p.category_id = CAST(:categoryId AS bigint)) " +
                        "AND (CAST(:brandId AS bigint) IS NULL OR p.brand_id = CAST(:brandId AS bigint)) " +
                        "AND (CAST(:minPrice AS double precision) IS NULL OR p.price >= CAST(:minPrice AS double precision)) " +
                        "AND (CAST(:maxPrice AS double precision) IS NULL OR p.price <= CAST(:maxPrice AS double precision))", 
                countQuery = "SELECT count(*) FROM products p WHERE " +
                        "(CAST(:query AS text) IS NULL OR CAST(p.name AS text) ILIKE '%' || CAST(:query AS text) || '%') " +
                        "AND (CAST(:categoryId AS bigint) IS NULL OR p.category_id = CAST(:categoryId AS bigint)) " +
                        "AND (CAST(:brandId AS bigint) IS NULL OR p.brand_id = CAST(:brandId AS bigint)) " +
                        "AND (CAST(:minPrice AS double precision) IS NULL OR p.price >= CAST(:minPrice AS double precision)) " +
                        "AND (CAST(:maxPrice AS double precision) IS NULL OR p.price <= CAST(:maxPrice AS double precision))",
                nativeQuery = true)
        Page<Product> searchProducts(@Param("query") String query,
                        @Param("categoryId") Long categoryId,
                        @Param("brandId") Long brandId,
                        @Param("minPrice") Double minPrice,
                        @Param("maxPrice") Double maxPrice,
                        Pageable pageable);

        @Query(value = "SELECT * FROM products p WHERE CAST(p.name AS text) ILIKE '%' || CAST(:query AS text) || '%'", nativeQuery = true)
        List<Product> searchByName(@Param("query") String query);

        java.util.Optional<Product> findByName(String name);

        java.util.Optional<Product> findByNameIgnoreCase(String name);

        @Modifying
        @Transactional
        @Query("UPDATE Product p SET p.stockQuantity = :quantity")
        int updateAllStockQuantity(@Param("quantity") Integer quantity);

    long countByStockQuantityLessThan(Integer threshold);
}
