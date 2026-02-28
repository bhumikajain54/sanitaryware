package com.example.sanitary.ware.backend.repositories;

import com.example.sanitary.ware.backend.entities.Address;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByUserId(Long userId);

    @org.springframework.data.jpa.repository.Query("SELECT a FROM Address a WHERE a.user.id = :userId AND (a.deleted = false OR a.deleted IS NULL)")
    List<Address> findByUserIdAndDeletedFalse(Long userId);
}
