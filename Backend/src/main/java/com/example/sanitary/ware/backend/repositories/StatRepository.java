package com.example.sanitary.ware.backend.repositories;

import com.example.sanitary.ware.backend.entities.Stat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StatRepository extends JpaRepository<Stat, Long> {
}
