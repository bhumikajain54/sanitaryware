package com.example.sanitary.ware.backend;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@Slf4j
@SpringBootApplication
@EnableCaching
public class SanitaryWareBackendApplication {

	public static void main(String[] args) {
		log.info("Starting Sanitary Ware Backend Application...");
		SpringApplication.run(SanitaryWareBackendApplication.class, args);
		log.info("BACKEND STARTED SUCCESSFULLY ON PORT: " + System.getProperty("server.port", System.getenv("PORT") != null ? System.getenv("PORT") : "8080"));
	}

}
