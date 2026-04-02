package com.example.sanitary.ware.backend.controllers;

import com.example.sanitary.ware.backend.entities.User;
import com.example.sanitary.ware.backend.services.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.example.sanitary.ware.backend.services.ActivityLogService;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
@Slf4j
public class MediaController {

    private final FileStorageService fileStorageService;
    private final ActivityLogService activityLogService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadFile(
            @AuthenticationPrincipal Object principal,
            @RequestParam("file") MultipartFile file) {
        String filename = fileStorageService.save(file);

        if (principal instanceof User user) {
            activityLogService.log(user.getId(), user.getEmail(), "FILE_UPLOAD", "MEDIA", "Uploaded: " + filename);
        }

        Map<String, String> response = new HashMap<>();
        response.put("filename", filename);
        // Return relative URL for the frontend to use
        response.put("url", "/api/media/" + filename);
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
    public ResponseEntity<List<String>> listFiles() {
        return ResponseEntity.ok(fileStorageService.getAllFiles());
    }

    /**
     * Serves images securely with proper MIME types (Requirement 4).
     * Handles URL decoding for filenames with spaces/brackets (Requirement 2).
     */
    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> getFile(@PathVariable String filename) {
        try {
            // 1. Decode URL (Requirement 2)
            String decodedName = URLDecoder.decode(filename, StandardCharsets.UTF_8);
            log.debug("Fetching media: {}", decodedName);

            // 2. Load Resource
            Resource file = fileStorageService.load(decodedName);

            // 3. 404 Handling (Requirement 1)
            if (file == null) {
                log.warn("File not found: {}", decodedName);
                return ResponseEntity.notFound().build();
            }

            // 4. Safe MIME detection (Requirement 4)
            String contentType = determineContentType(decodedName);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getFilename() + "\"")
                    .body(file);

        } catch (Exception e) {
            log.error("Error serving file: {}", filename, e);
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping("/{filename:.+}")
    public ResponseEntity<Map<String, String>> deleteFile(@PathVariable String filename) {
        if (filename == null || filename.equals("undefined") || filename.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid filename provided"));
        }

        try {
            String decodedName = URLDecoder.decode(filename, StandardCharsets.UTF_8);
            boolean deleted = fileStorageService.delete(decodedName);
            
            if (deleted) {
                return ResponseEntity.ok(Map.of("message", "File deleted successfully"));
            } else {
                return ResponseEntity.status(404).body(Map.of("error", "File not found: " + decodedName));
            }
        } catch (Exception e) {
            log.error("Error deleting file: {}", filename, e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    private String determineContentType(String filename) {
        String lower = filename.toLowerCase();
        if (lower.endsWith(".png"))
            return "image/png";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg"))
            return "image/jpeg";
        if (lower.endsWith(".gif"))
            return "image/gif";
        if (lower.endsWith(".webp"))
            return "image/webp";
        if (lower.endsWith(".svg"))
            return "image/svg+xml";
        return "application/octet-stream";
    }

    /**
     * Explicit error handler for this controller (Requirement 7).
     */
    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<String> handleSecurity(SecurityException e) {
        return ResponseEntity.status(403).body("Access Denied: " + e.getMessage());
    }
}
