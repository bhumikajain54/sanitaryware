package com.example.sanitary.ware.backend.entities;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "addresses")
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name")
    @com.fasterxml.jackson.annotation.JsonProperty("fullName")
    private String fullName;

    @JsonProperty("phone")
    private String phone;

    @Column(name = "street_address")
    @JsonProperty("streetAddress")
    private String streetAddress;

    @JsonProperty("city")
    private String city;

    @JsonProperty("state")
    private String state;

    @Column(name = "zip_code")
    @JsonProperty("zipCode")
    private String zipCode;

    @JsonProperty("country")
    private String country;

    @Builder.Default
    @Column(name = "is_default", nullable = false)
    @JsonProperty("isDefault")
    private Boolean isDefaultAddress = false;

    @com.fasterxml.jackson.annotation.JsonIgnore
    public Boolean isDefault() {
        return Boolean.TRUE.equals(this.isDefaultAddress);
    }

    @com.fasterxml.jackson.annotation.JsonIgnore
    public void setIsDefault(Boolean isDefault) {
        this.isDefaultAddress = isDefault;
    }

    @ManyToOne
    @JoinColumn(name = "user_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    @Column(name = "deleted")
    @Builder.Default
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Boolean deleted = false;
}
