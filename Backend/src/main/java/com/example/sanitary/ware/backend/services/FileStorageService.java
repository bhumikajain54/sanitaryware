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
        try {
            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Files.copy(file.getInputStream(), this.root.resolve(filename));
            return filename;
        } catch (Exception e) {
            throw new RuntimeException("Could not store the file. Error: " + e.getMessage());
        }
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
