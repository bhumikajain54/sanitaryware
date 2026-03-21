package com.example.sanitary.ware.backend.services;

import com.example.sanitary.ware.backend.entities.User;
import com.example.sanitary.ware.backend.entities.Wallet;
import com.example.sanitary.ware.backend.entities.WalletTransaction;
import com.example.sanitary.ware.backend.repositories.WalletRepository;
import com.example.sanitary.ware.backend.repositories.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository transactionRepository;

    public Wallet getWalletForUser(User user) {
        return walletRepository.findByUser(user)
                .orElseGet(() -> {
                    Wallet w = Wallet.builder()
                            .user(user)
                            .balance(0.0)
                            .build();
                    return walletRepository.save(w);
                });
    }

    @Transactional
    public Wallet addMoney(User user, Double amount) {
        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("Amount must be greater than 0");
        }
        Wallet wallet = getWalletForUser(user);
        wallet.setBalance(wallet.getBalance() + amount);
        wallet = walletRepository.save(wallet);

        // Log transaction
        transactionRepository.save(WalletTransaction.builder()
                .wallet(wallet)
                .description("Added Money via UPI")
                .amount(amount)
                .type("CREDIT")
                .build());

        return wallet;
    }

    public java.util.List<com.example.sanitary.ware.backend.entities.WalletTransaction> getHistory(User user) {
        Wallet wallet = getWalletForUser(user);
        return transactionRepository.findByWalletIdOrderByCreatedAtDesc(wallet.getId());
    }
}
