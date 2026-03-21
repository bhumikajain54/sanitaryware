package com.example.sanitary.ware.backend.repositories;

import com.example.sanitary.ware.backend.entities.User;
import com.example.sanitary.ware.backend.entities.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WalletRepository extends JpaRepository<Wallet, Long> {
    Optional<Wallet> findByUser(User user);
}
