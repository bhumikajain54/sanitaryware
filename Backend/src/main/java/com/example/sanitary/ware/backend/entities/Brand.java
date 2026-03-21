package com.example.sanitary.ware.backend.entities;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "brands")
public class Brand {

    // Standard constructors provided by Lombok annotations (@NoArgsConstructor, @AllArgsConstructor)
    @com.fasterxml.jackson.annotation.JsonCreator
    public Brand(String name) {
        this.name = name;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    @Column(unique = true, nullable = true)
    private String code;

    private String description;

    private String country;

    private String status; // e.g., ACTIVE, INACTIVE

    private String logo;

    private String website;

    @OneToMany(mappedBy = "brand", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Product> products;
}
