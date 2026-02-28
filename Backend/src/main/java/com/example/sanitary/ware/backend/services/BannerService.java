package com.example.sanitary.ware.backend.services;

import com.example.sanitary.ware.backend.dto.BannerCsvDTO;
import com.example.sanitary.ware.backend.dto.BannerRequestDTO;
import com.example.sanitary.ware.backend.entities.Banner;
import com.example.sanitary.ware.backend.repositories.BannerRepository;
import com.opencsv.bean.CsvToBean;
import com.opencsv.bean.CsvToBeanBuilder;
import com.opencsv.bean.HeaderColumnNameMappingStrategy;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class BannerService {

    private final BannerRepository bannerRepository;
    private final Validator validator;
    private final ActivityLogService activityLogService;

    public List<Banner> getActiveBanners() {
        return bannerRepository.findByActiveTrueOrderByIdDesc();
    }

    public List<Banner> getAllBanners() {
        return bannerRepository.findAllByOrderByIdDesc();
    }

    public Banner getBannerById(Long id) {
        return bannerRepository.findById(id).orElseThrow(() -> new RuntimeException("Banner not found"));
    }

    public Banner createBanner(BannerRequestDTO dto) {
        log.info("Creating banner with DTO: {}", dto);
        if (dto.getImageUrl() == null || dto.getImageUrl().trim().isEmpty()) {
            log.error("Creation failed: imageUrl is null or empty in DTO");
            throw new RuntimeException("Image URL is required and cannot be null");
        }
        Banner banner = Banner.builder()
                .imageUrl(dto.getImageUrl())
                .title(dto.getTitle())
                .description(dto.getDescription())
                .linkUrl(dto.getLinkUrl())
                .active(dto.isActive())
                .build();
        return bannerRepository.save(banner);
    }

    public Banner updateBanner(Long id, BannerRequestDTO dto) {
        Banner banner = getBannerById(id);
        if (dto.getImageUrl() != null)
            banner.setImageUrl(dto.getImageUrl());
        banner.setTitle(dto.getTitle());
        banner.setDescription(dto.getDescription());
        banner.setLinkUrl(dto.getLinkUrl());
        banner.setActive(dto.isActive());
        return bannerRepository.save(banner);
    }

    public void deleteBanner(Long id) {
        bannerRepository.deleteById(id);
    }

    public List<String> importBanners(MultipartFile file) throws Exception {
        List<String> errors = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            HeaderColumnNameMappingStrategy<BannerCsvDTO> strategy = new HeaderColumnNameMappingStrategy<>();
            strategy.setType(BannerCsvDTO.class);

            CsvToBean<BannerCsvDTO> csvToBean = new CsvToBeanBuilder<BannerCsvDTO>(reader)
                    .withMappingStrategy(strategy)
                    .withIgnoreEmptyLine(true)
                    .withThrowExceptions(false)
                    .build();

            Iterator<BannerCsvDTO> iterator = csvToBean.iterator();

            int rowIndex = 1;
            while (iterator.hasNext()) {
                rowIndex++;
                BannerCsvDTO dto = null;
                try {
                    dto = iterator.next();
                } catch (Exception e) {
                    errors.add("Row " + rowIndex + ": Parsing error - " + e.getMessage());
                    continue;
                }

                if (dto == null)
                    continue;

                try {
                    Set<ConstraintViolation<BannerCsvDTO>> violations = validator.validate(dto);
                    if (!violations.isEmpty()) {
                        String errorMessage = violations.stream()
                                .map(ConstraintViolation::getMessage)
                                .collect(Collectors.joining(", "));
                        errors.add("Row " + rowIndex + ": " + errorMessage);
                        continue;
                    }

                    Banner banner = Banner.builder()
                            .imageUrl(dto.getImageUrl())
                            .title(dto.getTitle())
                            .description(dto.getDescription())
                            .linkUrl(dto.getLinkUrl())
                            .active(dto.getActive())
                            .build();
                    bannerRepository.save(banner);
                } catch (Exception e) {
                    errors.add("Row " + rowIndex + ": " + e.getMessage());
                }
            }
            csvToBean.getCapturedExceptions()
                    .forEach(e -> errors.add("Line " + e.getLineNumber() + ": " + e.getMessage()));
        }
        activityLogService.log(1L, "admin@example.com", "IMPORT_BANNERS", "BANNERS",
                "Imported banners from " + file.getOriginalFilename());
        return errors;
    }
}
