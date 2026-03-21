package com.example.sanitary.ware.backend.services;

import com.example.sanitary.ware.backend.entities.SavedPaymentMethod;
import com.example.sanitary.ware.backend.entities.User;
import com.example.sanitary.ware.backend.repositories.SavedPaymentMethodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SavedPaymentMethodService {

    private final SavedPaymentMethodRepository repository;

    public List<SavedPaymentMethod> getSavedCards(User user) {
        return repository.findByUserAndType(user, "CARD");
    }

    public List<SavedPaymentMethod> getSavedUpis(User user) {
        return repository.findByUserAndType(user, "UPI");
    }

    public SavedPaymentMethod addSavedCard(User user, Map<String, String> data) {
        SavedPaymentMethod method = SavedPaymentMethod.builder()
                .user(user)
                .type("CARD")
                .cardNumber(data.get("cardNumber"))
                .expiry(data.get("expiry"))
                .cardHolderName(data.get("cardHolderName"))
                .build();
        return repository.save(method);
    }

    public SavedPaymentMethod addSavedUpi(User user, String upiId) {
        SavedPaymentMethod method = SavedPaymentMethod.builder()
                .user(user)
                .type("UPI")
                .upiId(upiId)
                .build();
        return repository.save(method);
    }

    public void deleteSavedMethod(User user, Long id) {
        Optional<SavedPaymentMethod> methodOpt = repository.findByIdAndUser(id, user);
        methodOpt.ifPresent(repository::delete);
    }
}
