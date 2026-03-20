package com.example.sanitary.ware.backend.services;

import com.example.sanitary.ware.backend.dto.AuthResponse;
import com.example.sanitary.ware.backend.dto.LoginRequest;
import com.example.sanitary.ware.backend.dto.RegisterRequest;
import com.example.sanitary.ware.backend.entities.User;
import com.example.sanitary.ware.backend.enums.Role;
import com.example.sanitary.ware.backend.repositories.UserRepository;
import com.example.sanitary.ware.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.example.sanitary.ware.backend.dto.SocialLoginRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

        private final UserRepository userRepository;
        private final ActivityLogService activityLogService;
        private final JwtService jwtService;
        private final PasswordEncoder passwordEncoder;
        private final AuthenticationManager authenticationManager;

        public AuthResponse register(@NonNull RegisterRequest request) {
                if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                        throw new RuntimeException("Email already exists");
                }

                User user = User.builder()
                                .firstName(request.getFirstName())
                                .lastName(request.getLastName())
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .phone(request.getPhone())
                                .role(request.getRole() != null ? request.getRole() : Role.CUSTOMER)
                                .active(true)
                                .build();

                User savedUser = userRepository.save(user);

                String jwtToken = jwtService.generateToken(savedUser);

                activityLogService.log(savedUser.getId(), savedUser.getEmail(), "USER_REGISTER", "AUTH",
                                "Registered new user");

                return AuthResponse.builder()
                                .id(savedUser.getId())
                                .token(jwtToken)
                                .email(savedUser.getEmail())
                                .role(savedUser.getRole())
                                .firstName(savedUser.getFirstName())
                                .lastName(savedUser.getLastName())
                                .build();
        }

        public AuthResponse login(@NonNull LoginRequest request) {
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail(),
                                                request.getPassword()));

                User user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                String jwtToken = jwtService.generateToken(user);

                activityLogService.log(user.getId(), user.getEmail(), "USER_LOGIN", "AUTH", "Logged in");

                return AuthResponse.builder()
                                .id(user.getId())
                                .token(jwtToken)
                                .email(user.getEmail())
                                .role(user.getRole())
                                .firstName(user.getFirstName())
                                .lastName(user.getLastName())
                                .build();
        }

        public boolean isAdminExists() {
                return userRepository.existsByRole(Role.ADMIN);
        }

        public AuthResponse socialLogin(@NonNull SocialLoginRequest request) {
                User user;
                if ("google".equalsIgnoreCase(request.getProvider())) {
                        user = verifyGoogleToken(request.getToken());
                } else if ("facebook".equalsIgnoreCase(request.getProvider())) {
                        user = verifyFacebookToken(request.getToken());
                } else {
                        throw new RuntimeException("Unsupported provider: " + request.getProvider());
                }

                String jwtToken = jwtService.generateToken(user);
                activityLogService.log(user.getId(), user.getEmail(), "SOCIAL_LOGIN", "AUTH",
                                "Logged in via " + request.getProvider());

                return AuthResponse.builder()
                                .id(user.getId())
                                .token(jwtToken)
                                .email(user.getEmail())
                                .role(user.getRole())
                                .firstName(user.getFirstName())
                                .lastName(user.getLastName())
                                .build();
        }

        private User verifyGoogleToken(String token) {
                try {
                        System.out.println("🔍 Verifying Google token: "
                                        + (token.length() > 20 ? token.substring(0, 20) + "..." : token));
                        String url;
                        // id_tokens are usually JWTs (3 parts)
                        if (token.contains(".") && token.split("\\.").length == 3) {
                                System.out.println("✅ Detected ID Token format");
                                url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + token;
                        } else {
                                System.out.println("📝 Detected Access Token format");
                                url = "https://www.googleapis.com/oauth2/v3/userinfo?access_token=" + token;
                        }

                        org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
                        java.util.Map<?, ?> response = restTemplate.getForObject(url, java.util.Map.class);

                        if (response == null || response.containsKey("error")) {
                                String error = (response != null && response.containsKey("error")) ? (String) response.get("error") : "Empty response";
                                System.out.println("❌ Google API error: " + error);
                                throw new RuntimeException("Invalid Google token: " + error);
                        }

                        String email = (String) response.get("email");
                        if (email == null && response.containsKey("sub")) {
                                // Sometimes sub is returned but email scope wasn't fully authorized
                                // but we need email for registration
                                throw new RuntimeException("Google token is valid but doesn't contain email. Please grant email scope.");
                        }

                        String firstName = (String) (response.containsKey("given_name") ? response.get("given_name")
                                        : response.get("name"));
                        String lastName = (String) response.get("family_name");

                        System.out.println("✅ Authenticated: " + email);
                        return getOrCreateUser(email, firstName, lastName);
                } catch (Exception e) {
                        System.out.println("❌ Google Auth Exception: " + e.getMessage());
                        throw new RuntimeException("Google authentication failed: " + e.getMessage());
                }
        }

        private User verifyFacebookToken(String token) {
                try {
                        System.out.println("🔍 Verifying Facebook token...");
                        String url = "https://graph.facebook.com/me?fields=id,name,email,first_name,last_name&access_token=" + token;

                        org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
                        java.util.Map<?, ?> response = restTemplate.getForObject(url, java.util.Map.class);

                        if (response == null || response.containsKey("error")) {
                                throw new RuntimeException("Invalid Facebook token");
                        }

                        String email = (String) response.get("email");
                        if (email == null) {
                                // Facebook requires user to grant email permission explicitly
                                throw new RuntimeException("Facebook did not provide an email address. Please ensure you have granted email permissions.");
                        }
                        
                        String firstName = (String) response.get("first_name");
                        String lastName = (String) response.get("last_name");
                        
                        return getOrCreateUser(email, firstName, lastName);
                } catch (Exception e) {
                        System.out.println("❌ Facebook Auth Exception: " + e.getMessage());
                        throw new RuntimeException("Facebook authentication failed: " + e.getMessage());
                }
        }

        private User getOrCreateUser(String email, String firstName, String lastName) {
                return userRepository.findByEmail(email)
                                .orElseGet(() -> {
                                        System.out.println("🌱 Creating new social user: " + email);
                                        User newUser = User.builder()
                                                        .email(email)
                                                        .firstName(firstName != null ? firstName : "Social")
                                                        .lastName(lastName != null ? lastName : "User")
                                                        .password(passwordEncoder
                                                                        .encode(java.util.UUID.randomUUID().toString()))
                                                        .role(Role.CUSTOMER)
                                                        .active(true)
                                                        .build();
                                        User saved = userRepository.save(newUser);
                                        System.out.println("✅ Social user registered with ID: " + saved.getId());
                                        return saved;
                                });
        }
}
