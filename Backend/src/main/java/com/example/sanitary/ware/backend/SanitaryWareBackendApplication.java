package com.example.sanitary.ware.backend;

import com.example.sanitary.ware.backend.services.FileStorageService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EnableCaching
public class SanitaryWareBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(SanitaryWareBackendApplication.class, args);
	}

	@Bean
	CommandLineRunner init(FileStorageService fileStorageService) {
		return args -> {
			fileStorageService.init();
		};
	}

}
