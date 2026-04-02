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

    // Standard constructors provided by Lombok annotations (@NoArgsConstructor,
    // @AllArgsConstructor)
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

    @Column(columnDefinition = "TEXT")
    private String description;

    private String country;

    private String status; // e.g., ACTIVE, INACTIVE

    @Column(columnDefinition = "BYTEA")
    private byte[] logo;

    @com.fasterxml.jackson.annotation.JsonProperty("logo")
    public void setLogo(Object value) {
        if (value == null) {
            this.logo = null;
            return;
        }
        if (value instanceof byte[]) {
            this.logo = (byte[]) value;
        } else if (value instanceof String) {
            String str = (String) value;
            if (str.startsWith("data:")) {
                // Strip the "data:image/png;base64," prefix for Jackson
                this.logo = java.util.Base64.getDecoder().decode(str.substring(str.indexOf(",") + 1));
            } else if (!str.isEmpty()) {
                // Handle raw base64 string or URL (though URL won't decode, this prevents crash)
                try {
                    this.logo = java.util.Base64.getDecoder().decode(str);
                } catch (IllegalArgumentException e) {
                    // If it's a URL or invalid, we ignore it to prevent 400 error
                    // Optionally we could fetch the URL bytes here
                }
            }
        }
    }

    @Column(columnDefinition = "TEXT")
    private String website;

    @OneToMany(mappedBy = "brand", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Product> products;
}
