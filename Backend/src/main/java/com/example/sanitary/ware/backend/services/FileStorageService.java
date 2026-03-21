package com.example.sanitary.ware.backend.services;

import jakarta.annotation.PostConstruct;
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
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Senior-level Media Storage Service.
 * Correctly handles file operations, naming strategies, and security.
 */
@Service
public class FileStorageService {

    private final Path root;

    public FileStorageService(@Value("${file.upload-dir:uploads/}") String uploadDir) {
        this.root = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new RuntimeException("CRITICAL: Failed to initialize storage directory at " + root, e);
        }
    }

    public Path getRootPath() {
        return this.root;
    }

    /**
     * Stores file using a strict naming strategy (UUID + Sanitized Name).
     * Prevents spaces and brackets from reaching the disk (Requirement 3 & 9).
     */
    public String save(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Failed to store empty file.");
        }

        try {
            String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
            
            // Validate extension
            if (!isValidExtension(originalFilename)) {
                throw new IllegalArgumentException("Invalid file extension. Allowed: JPG, PNG, WEBP, GIF");
            }

            // Sanitization Strategy: UUID + no spaces/special chars
            String extension = originalFilename.contains(".") ? originalFilename.substring(originalFilename.lastIndexOf(".")) : ".png";
            String baseName = originalFilename.replace(extension, "").replaceAll("[^a-zA-Z0-9]", "_");
            String filename = UUID.randomUUID().toString().substring(0, 8) + "_" + baseName + extension;

            Path targetLocation = this.root.resolve(filename).normalize();
            
            // Security Check: Path Traversal (Requirement 6)
            if (!targetLocation.startsWith(this.root)) {
                throw new SecurityException("Cannot store file outside current directory.");
            }

            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file on disk", e);
        }
    }

    /**
     * Loads a file resource with security and 404 handling (Requirement 1 & 6).
     */
    public Resource load(String filename) {
        try {
            // Normalize path to prevent ../ attacks
            Path filePath = this.root.resolve(filename).normalize();
            if (!filePath.startsWith(this.root)) {
                return null; // Security violation
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                return null; // Returns null for 404 handling in controller
            }
        } catch (MalformedURLException e) {
            return null;
        }
    }

    public boolean delete(String filename) {
        try {
            Path filePath = this.root.resolve(filename).normalize();
            if (!filePath.startsWith(this.root)) {
                throw new SecurityException("Cannot delete file outside current directory.");
            }
            return Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Could not delete file: " + filename, e);
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
