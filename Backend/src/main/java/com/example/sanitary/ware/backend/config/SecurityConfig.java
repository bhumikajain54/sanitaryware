package com.example.sanitary.ware.backend.config;

import com.example.sanitary.ware.backend.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthFilter;
        private final AuthenticationProvider authenticationProvider;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .csrf(AbstractHttpConfigurer::disable)
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .authorizeHttpRequests(auth -> auth
                                                // 1. Auth Endpoints
                                                .requestMatchers("/api/auth/**").permitAll()

                                                // 2. Public Endpoints (Accessible without login)
                                                .requestMatchers(
                                                                "/api/products", "/api/products/**",
                                                                "/api/categories", "/api/categories/**",
                                                                "/api/brands", "/api/brands/**",
                                                                "/api/banners",
                                                                "/api/search", "/api/search/**",
                                                                "/api/media", "/api/media/**",
                                                                "/api/notifications", "/api/notifications/**",
                                                                "/api/testimonials", "/api/testimonials/**",
                                                                "/api/contact", "/api/contact/**",
                                                                "/api/content/**",
                                                                "/api/debug", "/api/debug/**",
                                                                "/uploads/**")
                                                .permitAll()

                                                // 3. Admin Endpoints
                                                .requestMatchers("/api/admin/**", "/api/banners/admin/**")
                                                .hasRole("ADMIN")

                                                // 4. Brand Organizer Endpoints (Allow ADMIN as well)
                                                .requestMatchers("/api/brand/**").hasAnyRole("BRAND_ORGANIZER", "ADMIN")

                                                // 5. Customer Endpoints (Allow ADMIN as well)
                                                .requestMatchers("/api/customer/**").hasAnyRole("CUSTOMER", "ADMIN")

                                                // 6. Payment Endpoints (Verify & Status update should be public for
                                                // callbacks)
                                                .requestMatchers(
                                                                "/api/payment/verify-razorpay",
                                                                "/api/payment/update-status")
                                                .permitAll()

                                                // 7. Generic Authenticated Endpoints (Cart, Orders, etc.)
                                                .requestMatchers(
                                                                "/api/cart/**",
                                                                "/api/orders/**",
                                                                "/api/addresses/**",
                                                                "/api/reviews/**",
                                                                "/api/payment/**")
                                                .authenticated()

                                                // 8. Explicitly allow OPTIONS for CORS pre-flight
                                                .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**")
                                                .permitAll()

                                                // 9. Fallback
                                                .anyRequest().authenticated())
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authenticationProvider(authenticationProvider)
                                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                configuration.setAllowedOriginPatterns(Arrays.asList(
                                "http://localhost:5173",
                                "http://localhost:3000",
                                "http://localhost:5174",
                                "http://localhost:*",
                                "*"));
                configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
                configuration.setAllowedHeaders(
                                Arrays.asList("Authorization", "Content-Type", "Accept", "X-Requested-With", "Origin",
                                                "x-user-id"));
                configuration.setAllowCredentials(true);
                configuration.setExposedHeaders(List.of("Authorization"));

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }
}