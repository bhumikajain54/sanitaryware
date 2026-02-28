package com.example.sanitary.ware.backend.services;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;

import com.example.sanitary.ware.backend.dto.BrandCsvDTO;
import com.example.sanitary.ware.backend.entities.Brand;
import com.example.sanitary.ware.backend.repositories.BrandRepository;
import com.opencsv.bean.CsvToBean;
import com.opencsv.bean.CsvToBeanBuilder;
import com.opencsv.bean.HeaderColumnNameMappingStrategy;
import com.opencsv.bean.StatefulBeanToCsv;
import com.opencsv.bean.StatefulBeanToCsvBuilder;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.Writer;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BrandService {

    private final BrandRepository brandRepository;
    private final Validator validator;
    private final ActivityLogService activityLogService;

    public List<String> importBrands(MultipartFile file) throws Exception {
        List<String> errors = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            HeaderColumnNameMappingStrategy<BrandCsvDTO> strategy = new HeaderColumnNameMappingStrategy<>();
            strategy.setType(BrandCsvDTO.class);

            CsvToBean<BrandCsvDTO> csvToBean = new CsvToBeanBuilder<BrandCsvDTO>(reader)
                    .withMappingStrategy(strategy)
                    .withIgnoreEmptyLine(true)
                    .withThrowExceptions(false)
                    .build();

            Iterator<BrandCsvDTO> iterator = csvToBean.iterator();

            int rowIndex = 1; // Header is line 1
            while (iterator.hasNext()) {
                rowIndex++;
                BrandCsvDTO dto = null;
                try {
                    dto = iterator.next();
                } catch (Exception e) {
                    errors.add("Row " + rowIndex + ": Parsing error - " + e.getMessage());
                    continue;
                }

                if (dto == null)
                    continue;

                try {
                    Set<ConstraintViolation<BrandCsvDTO>> violations = validator.validate(dto);
                    if (!violations.isEmpty()) {
                        String errorMessage = violations.stream()
                                .map(ConstraintViolation::getMessage)
                                .collect(Collectors.joining(", "));
                        errors.add("Row " + rowIndex + ": " + errorMessage);
                        continue;
                    }

                    final BrandCsvDTO currentDto = dto;
                    String normalizedName = dto.getName().trim();
                    String normalizedCode = dto.getCode().trim();

                    // Check by code first, then by name (ignore case)
                    Optional<Brand> existingByCode = brandRepository.findByCode(normalizedCode);
                    Optional<Brand> existingByName = existingByCode.isEmpty()
                            ? brandRepository.findByNameIgnoreCase(normalizedName)
                            : Optional.empty();

                    if (existingByCode.isPresent()) {
                        Brand existing = existingByCode.get();
                        existing.setName(normalizedName);
                        existing.setDescription(currentDto.getDescription());
                        existing.setCountry(currentDto.getCountry());
                        existing.setStatus(currentDto.getStatus());
                        brandRepository.save(existing);
                    } else if (existingByName.isPresent()) {
                        Brand existing = existingByName.get();
                        existing.setCode(normalizedCode);
                        existing.setDescription(currentDto.getDescription());
                        existing.setCountry(currentDto.getCountry());
                        existing.setStatus(currentDto.getStatus());
                        brandRepository.save(existing);
                    } else {
                        Brand newBrand = Brand.builder()
                                .name(normalizedName)
                                .code(normalizedCode)
                                .description(currentDto.getDescription())
                                .country(currentDto.getCountry())
                                .status(currentDto.getStatus())
                                .build();
                        brandRepository.save(newBrand);
                    }
                } catch (Exception e) {
                    errors.add("Row " + rowIndex + ": " + e.getMessage());
                }
            }

            // Capture any remaining exceptions from the bean builder itself
            csvToBean.getCapturedExceptions()
                    .forEach(e -> errors.add("Line " + e.getLineNumber() + ": " + e.getMessage()));
        }
        return errors;
    }

    public void exportBrands(Writer writer) throws Exception {
        List<Brand> brands = brandRepository.findAll();
        List<BrandCsvDTO> dtos = brands.stream().map(brand -> new BrandCsvDTO(
                brand.getName(),
                brand.getCode(),
                brand.getDescription(),
                brand.getCountry(),
                brand.getStatus())).collect(Collectors.toList());

        StatefulBeanToCsv<BrandCsvDTO> beanToCsv = new StatefulBeanToCsvBuilder<BrandCsvDTO>(writer)
                .withApplyQuotesToAll(false)
                .build();

        beanToCsv.write(dtos);
    }

    public void exportBrandsToPdf(HttpServletResponse response) throws Exception {
        List<Brand> brands = brandRepository.findAll();

        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, response.getOutputStream());

        document.open();
        Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
        font.setSize(18);

        Paragraph p = new Paragraph("Brand List", font);
        p.setAlignment(Paragraph.ALIGN_CENTER);
        document.add(p);

        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100f);
        table.setWidths(new float[] { 1.5f, 3.0f, 2.0f, 2.0f, 1.5f });
        table.setSpacingBefore(10);

        writeTableHeader(table);
        writeTableData(table, brands);

        document.add(table);
        document.close();
    }

    private void writeTableHeader(PdfPTable table) {
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(java.awt.Color.BLUE);
        cell.setPadding(5);

        Font font = FontFactory.getFont(FontFactory.HELVETICA);
        font.setColor(java.awt.Color.WHITE);

        cell.setPhrase(new Phrase("Code", font));
        table.addCell(cell);

        cell.setPhrase(new Phrase("Name", font));
        table.addCell(cell);

        cell.setPhrase(new Phrase("Country", font));
        table.addCell(cell);

        cell.setPhrase(new Phrase("Status", font));
        table.addCell(cell);

        cell.setPhrase(new Phrase("ID", font));
        table.addCell(cell);
    }

    private void writeTableData(PdfPTable table, List<Brand> brands) {
        for (Brand brand : brands) {
            table.addCell(brand.getCode());
            table.addCell(brand.getName());
            table.addCell(brand.getCountry() != null ? brand.getCountry() : "-");
            table.addCell(brand.getStatus() != null ? brand.getStatus() : "-");
            table.addCell(String.valueOf(brand.getId()));
        }
    }

    @Cacheable(value = "brands")
    public List<Brand> getAllBrands() {
        return brandRepository.findAll();
    }

    public Brand getBrandById(@NonNull Long id) {
        return brandRepository.findById(id).orElseThrow(() -> new RuntimeException("Brand not found"));
    }

    @CacheEvict(value = "brands", allEntries = true)
    public Brand createBrand(@NonNull Brand brand) {
        if (brand.getName() == null || brand.getName().trim().isEmpty()) {
            throw new RuntimeException("Brand name is required");
        }

        String normalizedName = brand.getName().trim();

        // Check for existing brand with same name (case-insensitive)
        Optional<Brand> existing = brandRepository.findByNameIgnoreCase(normalizedName);
        if (existing.isPresent()) {
            return existing.get(); // Or throw exception if preferred. Returning existing prevents duplicates.
        }

        brand.setName(normalizedName);
        if (brand.getCode() == null || brand.getCode().trim().isEmpty()) {
            brand.setCode(generateCode(normalizedName));
        }
        Brand saved = brandRepository.save(brand);
        activityLogService.log(1L, "admin@example.com", "CREATE_BRAND", "BRANDS", "Created: " + saved.getName());
        return saved;
    }

    private String generateCode(String name) {
        if (name == null || name.isEmpty())
            return "BRD-" + System.currentTimeMillis();
        String prefix = name.length() >= 3 ? name.substring(0, 3).toUpperCase() : name.toUpperCase();
        return prefix + "-" + (int) (Math.random() * 9000 + 1000);
    }

    public Brand updateBrand(Long id, Brand brand) {
        @SuppressWarnings("null")
        Brand existingBrand = getBrandById(id);
        if (brand.getName() != null) {
            existingBrand.setName(brand.getName());
        }
        if (brand.getCode() != null && !brand.getCode().trim().isEmpty()) {
            existingBrand.setCode(brand.getCode());
        } else if (existingBrand.getCode() == null && brand.getName() != null) {
            existingBrand.setCode(generateCode(brand.getName()));
        }
        if (brand.getDescription() != null) {
            existingBrand.setDescription(brand.getDescription());
        }
        if (brand.getCountry() != null) {
            existingBrand.setCountry(brand.getCountry());
        }
        if (brand.getStatus() != null) {
            existingBrand.setStatus(brand.getStatus());
        }
        if (brand.getLogo() != null) {
            existingBrand.setLogo(brand.getLogo());
        }
        return brandRepository.save(existingBrand);
    }

    public void deleteBrand(@NonNull Long id) {
        brandRepository.deleteById(id);
        activityLogService.log(1L, "admin@example.com", "DELETE_BRAND", "BRANDS", "Deleted ID: " + id);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Brand getOrCreateByName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new RuntimeException("Brand name cannot be empty");
        }
        String normalizedName = name.trim();
        return brandRepository.findByNameIgnoreCase(normalizedName)
                .orElseGet(() -> {
                    try {
                        Brand newBrand = new Brand();
                        newBrand.setName(normalizedName);
                        newBrand.setCode(generateCode(normalizedName));
                        return brandRepository.saveAndFlush(newBrand);
                    } catch (Exception e) {
                        return brandRepository.findByNameIgnoreCase(normalizedName)
                                .orElseThrow(() -> new RuntimeException(
                                        "Could not create or find brand: " + normalizedName));
                    }
                });
    }
}
