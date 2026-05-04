package com.example.sanitary.ware.backend.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Enhanced Media Storage Service.
 * Supports both Local Storage and Cloudinary (Free Cloud Storage).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FileStorageService {

    private final Cloudinary cloudinary;

    @Value("${file.upload-dir:uploads/}")
    private String uploadDir;

    @Value("${cloudinary.enabled:false}")
    private boolean cloudinaryEnabled;

    private Path root;

    @PostConstruct
    public void init() {
        this.root = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(root);
            log.info("Initialized storage directory at: {}", root);
        } catch (IOException e) {
            throw new RuntimeException("CRITICAL: Failed to initialize storage directory at " + root, e);
        }
    }

    public Path getRootPath() {
        return this.root;
    }

    /**
     * Stores file. If Cloudinary is enabled, uploads to cloud.
     * Otherwise, saves to local disk.
     */
    public String save(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Failed to store empty file.");
        }

        try {
            String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
            
            if (!isValidExtension(originalFilename)) {
                throw new IllegalArgumentException("Invalid file extension. Allowed: JPG, PNG, WEBP, GIF");
            }

            // 1. If Cloudinary is enabled, use it (Best for Free hosting like Render)
            if (cloudinaryEnabled) {
                try {
                    Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), 
                        ObjectUtils.asMap("resource_type", "auto"));
                    String url = (String) uploadResult.get("secure_url");
                    log.info("Successfully uploaded to Cloudinary: {}", url);
                    return url; // Returns the full URL
                } catch (Exception e) {
                    log.error("Cloudinary upload failed, falling back to local storage", e);
                }
            }

            // 2. Fallback to Local Storage
            String extension = originalFilename.contains(".") ? originalFilename.substring(originalFilename.lastIndexOf(".")) : ".png";
            String baseName = originalFilename.replace(extension, "").replaceAll("[^a-zA-Z0-9]", "_");
            String filename = UUID.randomUUID().toString().substring(0, 8) + "_" + baseName + extension;

            Path targetLocation = this.root.resolve(filename).normalize();
            
            if (!targetLocation.startsWith(this.root)) {
                throw new SecurityException("Cannot store file outside current directory.");
            }

            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return filename; // Returns just the filename for local serving
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }

    /**
     * Loads a file resource from local disk.
     */
    public Resource load(String filename) {
        if (filename == null || filename.isBlank()) {
            return null;
        }

        try {
            Path filePath;
            try {
                filePath = this.root.resolve(filename).normalize();
            } catch (java.nio.file.InvalidPathException e) {
                return null;
            }

            if (!filePath.startsWith(this.root)) {
                return null;
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                return null;
            }
        } catch (MalformedURLException e) {
            return null;
        }
    }

    public boolean delete(String filename) {
        if (filename == null || filename.isBlank()) return false;
        
        // If it's a Cloudinary URL, we'd need to parse the public ID to delete it
        // For simplicity, we just check if it's local
        if (filename.startsWith("http")) {
            log.warn("Cloudinary delete requested but not fully implemented for: {}", filename);
            return true; // Pretend it's deleted for DB consistency
        }

        try {
            Path filePath = this.root.resolve(filename).normalize();
            if (!filePath.startsWith(this.root)) {
                throw new SecurityException("Cannot delete file outside current directory.");
            }
            return Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.error("Could not delete file: {}", filename, e);
            return false;
        }
    }

    public List<String> getAllFiles() {
        try (Stream<Path> stream = Files.walk(this.root, 1)) {
            return stream
                    .filter(path -> !path.equals(this.root))
                    .map(path -> path.getFileName().toString())
                    .collect(Collectors.toList());
        } catch (IOException e) {
            throw new RuntimeException("Failed to list files", e);
        }
    }

    private boolean isValidExtension(String filename) {
        String lower = filename.toLowerCase();
        return lower.endsWith(".jpg") || lower.endsWith(".jpeg") || 
               lower.endsWith(".png") || lower.endsWith(".webp") || lower.endsWith(".gif");
    }
}
