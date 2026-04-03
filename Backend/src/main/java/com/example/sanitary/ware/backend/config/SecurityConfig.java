package com.example.sanitary.ware.backend.config;

import com.example.sanitary.ware.backend.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.firewall.HttpFirewall;
import org.springframework.security.web.firewall.StrictHttpFirewall;
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
        public HttpFirewall allowUrlEncodedSlashHttpFirewall() {
                StrictHttpFirewall firewall = new StrictHttpFirewall();
                // Allow common characters in filenames that are normally restricted
                firewall.setAllowUrlEncodedSlash(true);
                firewall.setAllowUrlEncodedDoubleSlash(true);
                firewall.setAllowUrlEncodedPercent(true);
                firewall.setAllowUrlEncodedPeriod(true);
                firewall.setAllowSemicolon(true);
                firewall.setAllowBackSlash(true);
                return firewall;
        }

        @Bean
        public WebSecurityCustomizer webSecurityCustomizer() {
                return (web) -> web.httpFirewall(allowUrlEncodedSlashHttpFirewall());
        }

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .csrf(AbstractHttpConfigurer::disable)
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .authorizeHttpRequests(auth -> auth
                                                // 1. Auth Endpoints
                                                .requestMatchers("/api/auth/**").permitAll()

                                                // 2. Actuator & Custom health checks - must be public for Docker/Render
                                                // health
                                                // checks
                                                .requestMatchers("/", "/actuator/**", "/api/health/**")
                                                .permitAll()

                                                // 3. Public Endpoints (Accessible without login)
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
                                                                "/api/admin/tally/status",
                                                                "/api/admin/tally/test-connection",
                                                                "/uploads/**")
                                                .permitAll()

                                                // 4. Admin Endpoints
                                                .requestMatchers("/api/admin/**", "/api/banners/admin/**",
                                                                "/api/tally/**")
                                                .hasRole("ADMIN")

                                                // 5. Brand Organizer Endpoints (Allow ADMIN as well)
                                                .requestMatchers("/api/brand/**").hasAnyRole("BRAND_ORGANIZER", "ADMIN")

                                                // 5. Customer Endpoints (Allow ADMIN as well)
                                                .requestMatchers("/api/customer/**")
                                                .hasAnyRole("USER", "CUSTOMER", "ADMIN")

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

        @org.springframework.beans.factory.annotation.Value("${application.security.frontend-url:*}")
        private String frontendUrl;

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();

                // Allow specific origins including the environment variable
                List<String> allowedOrigins = Arrays.asList(
                                "http://localhost:5173",
                                "http://localhost:5174",
                                "http://localhost:3000",
                                "https://singhai-traders.netlify.app");

                configuration.setAllowedOrigins(allowedOrigins);

                // Use patterns for more flexible matching (e.g. Vercel preview)
                configuration.setAllowedOriginPatterns(Arrays.asList(
                                frontendUrl,
                                "http://localhost:*",
                                "https://*.vercel.app",
                                "https://*.render.com"));

                configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
                configuration.setAllowedHeaders(
                                Arrays.asList("Authorization", "Content-Type", "Accept", "X-Requested-With", "Origin",
                                                "x-user-id", "x-rtb-fingerprint-id"));
                configuration.setAllowCredentials(true);
                configuration.setExposedHeaders(List.of("Authorization"));

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }
}