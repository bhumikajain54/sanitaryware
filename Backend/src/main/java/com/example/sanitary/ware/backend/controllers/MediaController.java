package com.example.sanitary.ware.backend.controllers;

import com.example.sanitary.ware.backend.entities.User;
import com.example.sanitary.ware.backend.services.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.example.sanitary.ware.backend.services.ActivityLogService;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {

    private final FileStorageService fileStorageService;
    private final ActivityLogService activityLogService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadFile(
            @AuthenticationPrincipal User user,
            @RequestParam("file") MultipartFile file) {
        String filename = fileStorageService.save(file);

        if (user != null) {
            activityLogService.log(user.getId(), user.getEmail(), "FILE_UPLOAD", "MEDIA", "Uploaded: " + filename);
        }

        Map<String, String> response = new HashMap<>();
        response.put("filename", filename);
        // Return full URL for the frontend to use
        response.put("url", "http://localhost:8080/api/media/" + filename);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/upload-multiple", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<String>> uploadMultipleFiles(@RequestParam("files") MultipartFile[] files) {
        List<String> filenames = new ArrayList<>();
        for (MultipartFile file : files) {
            filenames.add(fileStorageService.save(file));
        }
        return ResponseEntity.ok(filenames);
    }

    @GetMapping
    public ResponseEntity<List<Map<String, String>>> getAllMedia() {
        List<String> filenames = fileStorageService.getAllFiles();
        Map<String, String> uniqueFiles = new HashMap<>();

        for (String filename : filenames) {
            String originalName = filename;
            int underscoreIndex = filename.indexOf('_');
            if (underscoreIndex != -1) {
                originalName = filename.substring(underscoreIndex + 1);
            }
            // Keep keys unique by original name, ensuring only one copy (the first found)
            // is shown
            uniqueFiles.putIfAbsent(originalName, filename);
        }

        List<Map<String, String>> response = new ArrayList<>();
        for (String filename : uniqueFiles.values()) {
            Map<String, String> fileInfo = new HashMap<>();
            fileInfo.put("filename", filename);
            fileInfo.put("url", "http://localhost:8080/api/media/" + filename);
            response.add(fileInfo);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> getFile(@PathVariable @org.springframework.lang.NonNull String filename) {
        Resource file = fileStorageService.load(filename);

        String contentType = "application/octet-stream";
        try {
            contentType = Files.probeContentType(file.getFile().toPath());
        } catch (IOException e) {
            // Fallback to octet-stream
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType != null ? contentType : "application/octet-stream"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getFilename() + "\"")
                .body(file);
    }
}
