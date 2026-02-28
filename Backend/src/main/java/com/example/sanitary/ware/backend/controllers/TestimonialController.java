package com.example.sanitary.ware.backend.controllers;

import com.example.sanitary.ware.backend.entities.Testimonial;
import com.example.sanitary.ware.backend.repositories.TestimonialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/testimonials")
@RequiredArgsConstructor
public class TestimonialController {

    private final TestimonialRepository testimonialRepository;

    @GetMapping
    public ResponseEntity<List<Testimonial>> getAllTestimonials() {
        return ResponseEntity.ok(testimonialRepository.findByActiveTrue());
    }

    @PostMapping("/admin")
    public ResponseEntity<Testimonial> createTestimonial(@RequestBody @NonNull Testimonial testimonial) {
        return ResponseEntity.ok(testimonialRepository.save(testimonial));
    }

    @PutMapping("/admin/{id}")
    public ResponseEntity<Testimonial> updateTestimonial(@PathVariable @NonNull Long id,
            @RequestBody Testimonial updated) {
        Testimonial t = testimonialRepository.findById(id).orElseThrow();
        t.setName(updated.getName());
        t.setDesignation(updated.getDesignation());
        t.setContent(updated.getContent());
        t.setImage(updated.getImage());
        t.setActive(updated.isActive());
        return ResponseEntity.ok(testimonialRepository.save(t));
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<Void> deleteTestimonial(@PathVariable @NonNull Long id) {
        testimonialRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
