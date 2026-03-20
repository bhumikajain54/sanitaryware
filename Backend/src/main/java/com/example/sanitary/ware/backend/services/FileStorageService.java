package com.example.sanitary.ware.backend.services;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path root = Paths.get("uploads");

    @PostConstruct
    public void init() {
        try {
            if (!Files.exists(root)) {
                Files.createDirectory(root);
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize folder for upload!");
        }
    }

    public String save(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("Failed to store empty file.");
        }

        // 1. Validation: File Type
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !isValidExtension(originalFilename)) {
            throw new RuntimeException("Invalid file type. Only JPG, PNG, and WEBP images are allowed.");
        }

        try {
            // 2. Clean filename and add UUID to prevent collisions
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String cleanName = originalFilename.replace(extension, "").replaceAll("[^a-zA-Z0-9]", "_");
            String filename = cleanName + "_" + UUID.randomUUID().toString().substring(0, 8) + extension;
            
            Files.copy(file.getInputStream(), this.root.resolve(filename));
            return filename;
        } catch (Exception e) {
            throw new RuntimeException("Could not store the file. Error: " + e.getMessage());
        }
    }

    private boolean isValidExtension(String filename) {
        String lower = filename.toLowerCase();
        return lower.endsWith(".jpg") || lower.endsWith(".jpeg") || 
               lower.endsWith(".png") || lower.endsWith(".webp");
    }

    public org.springframework.core.io.Resource load(String filename) {
        try {
            Path file = root.resolve(filename);
            java.net.URI uri = file.toUri();
            if (uri == null) {
                throw new RuntimeException("Could not get URI for file");
            }
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(uri);

            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Could not read the file!");
            }
        } catch (java.net.MalformedURLException e) {
            throw new RuntimeException("Error: " + e.getMessage());
        }
    }

    public java.util.List<String> getAllFiles() {
        try (java.util.stream.Stream<Path> stream = Files.walk(this.root, 1)) {
            return stream
                    .filter(path -> !path.equals(this.root))
                    .map(path -> path.getFileName().toString())
                    .collect(java.util.stream.Collectors.toList());
        } catch (IOException e) {
            throw new RuntimeException("Could not load the files!");
        }
    }
}
