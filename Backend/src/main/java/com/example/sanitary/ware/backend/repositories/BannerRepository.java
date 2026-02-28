package com.example.sanitary.ware.backend.repositories;

import com.example.sanitary.ware.backend.entities.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BannerRepository extends JpaRepository<Banner, Long> {
    List<Banner> findByActiveTrueOrderByIdDesc();

    List<Banner> findAllByOrderByIdDesc();
}
