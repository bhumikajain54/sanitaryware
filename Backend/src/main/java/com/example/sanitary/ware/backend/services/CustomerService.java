package com.example.sanitary.ware.backend.services;

import com.example.sanitary.ware.backend.entities.Address;
import com.example.sanitary.ware.backend.entities.CustomerPreference;
import com.example.sanitary.ware.backend.entities.Product;
import com.example.sanitary.ware.backend.entities.User;
import com.example.sanitary.ware.backend.entities.WishlistItem;
import com.example.sanitary.ware.backend.repositories.AddressRepository;
import com.example.sanitary.ware.backend.repositories.CustomerPreferenceRepository;
import com.example.sanitary.ware.backend.repositories.ProductRepository;
import com.example.sanitary.ware.backend.repositories.UserRepository;
import com.example.sanitary.ware.backend.repositories.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final CustomerPreferenceRepository customerPreferenceRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.example.sanitary.ware.backend.repositories.OrderRepository orderRepository;

    // Profile Methods
    public com.example.sanitary.ware.backend.dto.CustomerDetailDTO getCustomerDetails(Long userId) {
        User user = getProfileById(userId);

        // Get all orders for this customer
        List<com.example.sanitary.ware.backend.entities.Order> orders = orderRepository.findByUserId(userId);

        // Calculate total spent (excluding cancelled orders)
        double totalSpent = orders.stream()
                .filter(order -> order.getStatus() != com.example.sanitary.ware.backend.enums.OrderStatus.CANCELLED)
                .mapToDouble(order -> order.getTotalAmount() != null ? order.getTotalAmount() : 0.0)
                .sum();

        // Get last order date
        java.time.LocalDateTime lastOrderDate = orders.stream()
                .map(com.example.sanitary.ware.backend.entities.Order::getCreatedAt)
                .max(java.time.LocalDateTime::compareTo)
                .orElse(null);

        // Get addresses
        List<Address> addresses = getAddresses(userId);

        return com.example.sanitary.ware.backend.dto.CustomerDetailDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .orderCount((long) orders.size())
                .totalSpent(totalSpent)
                .lastOrderDate(lastOrderDate)
                .addresses(addresses)
                .addressCount(addresses.size())
                .build();
    }

    // Profile Methods
    public User getProfileById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateProfileById(Long userId, User updatedUser) {
        User user = getProfileById(userId);
        if (updatedUser.getFirstName() != null) {
            user.setFirstName(updatedUser.getFirstName());
        }
        if (updatedUser.getLastName() != null) {
            user.setLastName(updatedUser.getLastName());
        }
        if (updatedUser.getPhone() != null) {
            user.setPhone(updatedUser.getPhone());
        }
        return userRepository.save(user);
    }

    public void changePasswordById(Long userId, String oldPassword, String newPassword) {
        User user = getProfileById(userId);
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Invalid old password");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    // Address Methods
    public List<Address> getAddresses(Long userId) {
        return addressRepository.findByUserIdAndDeletedFalse(userId);
    }

    @Transactional
    public Address addAddress(Long userId, Address address) {
        if (address == null) {
            throw new RuntimeException("Address data is required");
        }
        User user = getProfileById(userId);
        address.setUser(user);
        address.setId(null); // Ensure it's a new address
        address.setDeleted(false);
        if (address.isDefault()) {
            resetDefaultAddresses(userId);
        }
        return addressRepository.save(address);
    }

    @Transactional
    public Address updateAddress(Long userId, Long addressId, Address updatedAddress) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));
        if (!address.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        address.setFullName(updatedAddress.getFullName());
        address.setPhone(updatedAddress.getPhone());
        address.setStreetAddress(updatedAddress.getStreetAddress());
        address.setCity(updatedAddress.getCity());
        address.setState(updatedAddress.getState());
        address.setZipCode(updatedAddress.getZipCode());
        address.setCountry(updatedAddress.getCountry());
        if (updatedAddress.isDefault()) {
            resetDefaultAddresses(userId);
            address.setIsDefault(true);
        }
        return addressRepository.save(address);
    }

    public void deleteAddress(Long userId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));
        if (!address.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        // Soft delete
        address.setDeleted(true);
        address.setIsDefault(false); // Remove default status if deleted
        addressRepository.save(address);
    }

    @Transactional
    public void setDefaultAddress(Long userId, Long addressId) {
        resetDefaultAddresses(userId);
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (Boolean.TRUE.equals(address.getDeleted())) {
            throw new RuntimeException("Cannot set deleted address as default");
        }

        address.setIsDefault(true);
        addressRepository.save(address);
    }

    private void resetDefaultAddresses(Long userId) {
        List<Address> addresses = addressRepository.findByUserIdAndDeletedFalse(userId);
        addresses.forEach(a -> a.setIsDefault(false));
        addressRepository.saveAll(addresses);
    }

    // Wishlist Methods
    public List<Product> getWishlist(Long userId) {
        return wishlistRepository.findByUserId(userId).stream()
                .map(WishlistItem::getProduct)
                .collect(Collectors.toList());
    }

    public void addToWishlist(Long userId, Long productId) {
        if (wishlistRepository.findByUserIdAndProductId(userId, productId).isPresent()) {
            return;
        }
        User user = getProfileById(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        WishlistItem item = WishlistItem.builder()
                .user(user)
                .product(product)
                .build();
        wishlistRepository.save(item);
    }

    @Transactional
    public void removeFromWishlist(Long userId, Long productId) {
        wishlistRepository.deleteByUserIdAndProductId(userId, productId);
    }

    // Preference Methods
    public CustomerPreference getPreferences(Long userId) {
        return customerPreferenceRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreferences(userId));
    }

    @Transactional
    public CustomerPreference updatePreferences(Long userId, CustomerPreference preferences) {
        CustomerPreference existingPreferences = customerPreferenceRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreferences(userId));

        existingPreferences.setEmailNotifications(preferences.isEmailNotifications());
        existingPreferences.setSmsNotifications(preferences.isSmsNotifications());
        existingPreferences.setOrderUpdates(preferences.isOrderUpdates());
        existingPreferences.setPromotionalEmails(preferences.isPromotionalEmails());
        existingPreferences.setNewsletter(preferences.isNewsletter());

        return customerPreferenceRepository.save(existingPreferences);
    }

    private CustomerPreference createDefaultPreferences(Long userId) {
        User user = getProfileById(userId);
        CustomerPreference preferences = CustomerPreference.builder()
                .user(user)
                .emailNotifications(true)
                .smsNotifications(false)
                .orderUpdates(true)
                .promotionalEmails(true)
                .newsletter(false)
                .build();
        return customerPreferenceRepository.save(preferences);
    }
}
