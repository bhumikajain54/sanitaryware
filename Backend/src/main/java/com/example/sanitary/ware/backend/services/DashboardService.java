package com.example.sanitary.ware.backend.services;

import com.example.sanitary.ware.backend.dto.DashboardStats;
import com.example.sanitary.ware.backend.dto.TrendData;
import com.example.sanitary.ware.backend.entities.Order;
import com.example.sanitary.ware.backend.entities.Product;
import com.example.sanitary.ware.backend.enums.OrderStatus;
import com.example.sanitary.ware.backend.repositories.OrderItemRepository;
import com.example.sanitary.ware.backend.repositories.OrderRepository;
import com.example.sanitary.ware.backend.repositories.ProductRepository;
import com.example.sanitary.ware.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
public class DashboardService {

        private static final Logger logger = LoggerFactory.getLogger(DashboardService.class);

        private final OrderRepository orderRepository;
        private final ProductRepository productRepository;
        private final UserRepository userRepository;
        private final OrderItemRepository orderItemRepository;

        public DashboardStats getStats(int days) {
                List<Order> orders;
                long totalCustomers;

                if (days > 0) {
                        LocalDateTime startDate = LocalDate.now().minusDays(days - 1).atStartOfDay();
                        orders = orderRepository.findByCreatedAtAfter(startDate);
                        totalCustomers = userRepository.countByCreatedAtAfter(startDate);
                } else {
                        // For global dashboard, still limit to last 500 for performance
                        orders = orderRepository.findTop500ByOrderByCreatedAtDesc();
                        totalCustomers = userRepository.count();
                }

                logger.info("Dashboard stats (days={}): Total orders found: {}", days, orders.size());

                double totalRevenue = orders.stream()
                                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                                .mapToDouble(o -> o.getTotalAmount() != null ? o.getTotalAmount() : 0.0)
                                .sum();

                long totalProducts = productRepository.count();

                long lowStockCount = productRepository.countByStockQuantityLessThan(10);

                List<Object[]> topProducts = orderItemRepository.findTopSellingProducts();
                List<Product> top5Products = topProducts.stream()
                                .map(obj -> (Product) obj[0])
                                .collect(Collectors.toList());

                // Recent orders list - if filtered, show recent from filtered list, else global
                // recent
                List<Order> recentOrders;
                if (days > 0) {
                        recentOrders = orders.stream()
                                        .sorted((o1, o2) -> o2.getCreatedAt().compareTo(o1.getCreatedAt()))
                                        .limit(50) // Limit to 50 for the dashboard UI
                                        .collect(Collectors.toList());
                } else {
                        recentOrders = orders.stream()
                                        .limit(50) // Limit to 50 for the dashboard UI
                                        .collect(Collectors.toList());
                }

                return DashboardStats.builder()
                                .totalOrders(orders.size())
                                .totalRevenue(totalRevenue)
                                .totalCustomers(totalCustomers)
                                .totalProducts(totalProducts)
                                .lowStockProducts(lowStockCount)
                                .topProducts(top5Products)
                                .recentOrders(recentOrders)
                                .build();
        }

        // Overload for backward compatibility if needed, or update controller to
        // specific calls.
        public DashboardStats getStats() {
                return getStats(0);
        }

        public List<TrendData> getRevenueTrend(int days) {
                LocalDateTime startDate = LocalDate.now().minusDays(days - 1).atStartOfDay();
                List<Order> latestOrders = orderRepository.findByCreatedAtAfter(startDate);
                logger.debug("Revenue trend: Found {} orders since {}", latestOrders.size(), startDate);

                Map<String, Double> revenueByDate = latestOrders.stream()
                                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                                .collect(Collectors.groupingBy(
                                                o -> o.getCreatedAt().toLocalDate().toString(),
                                                Collectors.summingDouble(
                                                                o -> o.getTotalAmount() != null ? o.getTotalAmount()
                                                                                : 0.0)));

                List<TrendData> trend = new ArrayList<>();
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

                for (int i = 0; i < days; i++) {
                        String dateLabel = LocalDate.now().minusDays(days - 1 - i).format(formatter);
                        trend.add(TrendData.builder()
                                        .date(dateLabel)
                                        .value(revenueByDate.getOrDefault(dateLabel, 0.0))
                                        .build());
                }

                return trend;
        }

        public List<TrendData> getOrdersTrend(int days) {
                LocalDateTime startDate = LocalDate.now().minusDays(days - 1).atStartOfDay();
                List<Order> latestOrders = orderRepository.findByCreatedAtAfter(startDate);
                logger.debug("Orders trend: Found {} orders since {}", latestOrders.size(), startDate);

                Map<String, Long> ordersByDate = latestOrders.stream()
                                .collect(Collectors.groupingBy(
                                                o -> o.getCreatedAt().toLocalDate().toString(),
                                                Collectors.counting()));

                List<TrendData> trend = new ArrayList<>();
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

                for (int i = 0; i < days; i++) {
                        String dateLabel = LocalDate.now().minusDays(days - 1 - i).format(formatter);
                        trend.add(TrendData.builder()
                                        .date(dateLabel)
                                        .value(ordersByDate.getOrDefault(dateLabel, 0L).doubleValue())
                                        .build());
                }

                return trend;
        }

        public List<Order> getRecentOrders() {
                return orderRepository.findAllByOrderByCreatedAtDesc().stream()
                                .collect(Collectors.toList());
        }
}
