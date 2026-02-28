package com.example.sanitary.ware.backend.services;

import com.example.sanitary.ware.backend.entities.ActivityLog;
import com.example.sanitary.ware.backend.repositories.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    public void log(Long userId, String email, String action, String module, String details) {
        ActivityLog log = ActivityLog.builder()
                .userId(userId)
                .userEmail(email)
                .action(action)
                .module(module)
                .details(details)
                .build();
        activityLogRepository.save(log);
    }

    public List<ActivityLog> getRecentLogs() {
        return activityLogRepository.findTop100ByOrderByCreatedAtDesc();
    }

    public List<ActivityLog> getUserActivityLogs(Long userId) {
        return activityLogRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}
