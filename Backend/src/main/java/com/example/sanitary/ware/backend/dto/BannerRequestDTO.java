package com.example.sanitary.ware.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BannerRequestDTO {

    @NotNull(message = "Image URL cannot be null")
    @NotBlank(message = "Image URL is required")
    @JsonProperty("imageUrl")
    @JsonAlias({ "image", "image_url", "url", "bannerImage", "banner_image", "imageURL", "img", "path" })
    private String imageUrl;

    private String title;
    private String description;

    @JsonProperty("linkUrl")
    @JsonAlias({ "link", "link_url" })
    private String linkUrl;

    private boolean active = true;
}
