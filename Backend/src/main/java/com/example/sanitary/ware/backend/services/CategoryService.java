package com.example.sanitary.ware.backend.services;

import com.example.sanitary.ware.backend.dto.CategoryCsvDTO;
import com.example.sanitary.ware.backend.entities.Category;
import com.example.sanitary.ware.backend.repositories.CategoryRepository;
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
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ActivityLogService activityLogService;
    private final Validator validator;

    public List<String> importCategories(MultipartFile file) throws Exception {
        List<String> errors = new ArrayList<>();
        List<Category> categoriesToSave = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
             com.opencsv.CSVReader csvReader = new com.opencsv.CSVReader(reader)) {
            
            String[] headers = csvReader.readNext();
            if (headers == null) return errors;

            Map<String, Integer> headerMap = new HashMap<>();
            for (int i = 0; i < headers.length; i++) {
                if (headers[i] != null) headerMap.put(headers[i].trim().toLowerCase(), i);
            }

            List<CategoryCsvDTO> dtos = new ArrayList<>();
            String[] line;
            int fileLine = 1;
            while ((line = csvReader.readNext()) != null) {
                fileLine++;
                CategoryCsvDTO dto = new CategoryCsvDTO();
                dto.setName(getLineValue(line, headerMap, "name", "category", "categoryname", "title"));
                dto.setDescription(getLineValue(line, headerMap, "description", "desc", "info"));
                dto.setImage(getLineValue(line, headerMap, "image", "img", "thumbnail", "photo"));
                dtos.add(dto);
            }

            // Pre-fetch all categories for performance
            List<Category> allCategories = categoryRepository.findAll();
            Map<String, Category> nameMap = allCategories.stream()
                    .collect(Collectors.toMap(c -> c.getName().toLowerCase(), c -> c, (e1, e2) -> e1));

            int rowIndex = 1;
            for (CategoryCsvDTO dto : dtos) {
                rowIndex++;
                if (dto == null)
                    continue;

                try {
                    Set<ConstraintViolation<CategoryCsvDTO>> violations = validator.validate(dto);
                    if (!violations.isEmpty()) {
                        errors.add("Row " + rowIndex + ": " + violations.iterator().next().getMessage());
                        continue;
                    }

                    String normalizedName = dto.getName().trim();
                    Category category = nameMap.get(normalizedName.toLowerCase());

                    if (category != null) {
                        category.setName(normalizedName);
                        category.setDescription(dto.getDescription());
                        category.setImage(dto.getImage());
                    } else {
                        category = new Category();
                        category.setName(normalizedName);
                        category.setDescription(dto.getDescription());
                        category.setImage(dto.getImage());
                        // Add to map so subsequent rows can find it
                        nameMap.put(normalizedName.toLowerCase(), category);
                    }
                    categoriesToSave.add(category);

                } catch (Exception e) {
                    errors.add("Row " + fileLine + ": " + e.getMessage());
                }
            }

            if (!categoriesToSave.isEmpty()) {
                categoryRepository.saveAll(categoriesToSave);
                activityLogService.log(1L, "admin@example.com", "IMPORT_CATEGORIES", "CATEGORIES",
                        "Imported " + categoriesToSave.size() + " categories");
            }

        }
        return errors;
    }

    private String getLineValue(String[] line, Map<String, Integer> headerMap, String... keys) {
        for (String key : keys) {
            Integer index = headerMap.get(key.toLowerCase());
            if (index != null && index < line.length) {
                String val = line[index];
                return (val != null && !val.trim().isEmpty()) ? val.trim() : null;
            }
        }
        return null;
    }

    public void exportCategories(Writer writer) throws Exception {
        List<Category> categories = categoryRepository.findAll();
        List<CategoryCsvDTO> dtos = categories.stream().map(c -> new CategoryCsvDTO(
                c.getName(),
                c.getDescription(),
                c.getImage())).collect(Collectors.toList());

        StatefulBeanToCsv<CategoryCsvDTO> beanToCsv = new StatefulBeanToCsvBuilder<CategoryCsvDTO>(writer)
                .withApplyQuotesToAll(false)
                .build();
        beanToCsv.write(dtos);
    }

    public void exportCategoriesToPdf(HttpServletResponse response) throws Exception {
        List<Category> categories = categoryRepository.findAll();

        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, response.getOutputStream());

        document.open();
        Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
        font.setSize(18);

        Paragraph p = new Paragraph("Category List", font);
        p.setAlignment(Paragraph.ALIGN_CENTER);
        document.add(p);

        PdfPTable table = new PdfPTable(3);
        table.setWidthPercentage(100f);
        table.setWidths(new float[] { 1.5f, 4.0f, 4.5f });
        table.setSpacingBefore(10);

        writeTableHeader(table);
        writeTableData(table, categories);

        document.add(table);
        document.close();
    }

    private void writeTableHeader(PdfPTable table) {
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(java.awt.Color.BLUE);
        cell.setPadding(5);

        Font font = FontFactory.getFont(FontFactory.HELVETICA);
        font.setColor(java.awt.Color.WHITE);

        cell.setPhrase(new Phrase("ID", font));
        table.addCell(cell);

        cell.setPhrase(new Phrase("Name", font));
        table.addCell(cell);

        cell.setPhrase(new Phrase("Description", font));
        table.addCell(cell);
    }

    private void writeTableData(PdfPTable table, List<Category> categories) {
        for (Category category : categories) {
            table.addCell(String.valueOf(category.getId()));
            table.addCell(category.getName());
            table.addCell(category.getDescription() != null ? category.getDescription() : "-");
        }
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category getCategoryById(@NonNull Long id) {
        return categoryRepository.findById(id).orElseThrow(() -> new RuntimeException("Category not found"));
    }

    public Category createCategory(@NonNull Category category) {
        Category saved = categoryRepository.save(category);
        activityLogService.log(1L, "admin@example.com", "CREATE_CATEGORY", "CATEGORIES", "Created: " + saved.getName());
        return saved;
    }

    public Category updateCategory(Long id, Category category) {
        Category existingCategory = getCategoryById(id);
        if (category.getName() != null) {
            existingCategory.setName(category.getName());
        }
        if (category.getDescription() != null) {
            existingCategory.setDescription(category.getDescription());
        }
        if (category.getImage() != null) {
            existingCategory.setImage(category.getImage());
        }
        Category saved = categoryRepository.save(existingCategory);
        activityLogService.log(1L, "admin@example.com", "UPDATE_CATEGORY", "CATEGORIES", "Updated: " + saved.getName());
        return saved;
    }

    public void deleteCategory(@NonNull Long id) {
        categoryRepository.deleteById(id);
        activityLogService.log(1L, "admin@example.com", "DELETE_CATEGORY", "CATEGORIES", "Deleted ID: " + id);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Category getOrCreateByName(String name) {
        return categoryRepository.findByName(name)
                .orElseGet(() -> {
                    try {
                        Category newCategory = new Category();
                        newCategory.setName(name);
                        return categoryRepository.saveAndFlush(newCategory);
                    } catch (Exception e) {
                        // In case of race condition where another transaction created it just now
                        return categoryRepository.findByName(name)
                                .orElseThrow(() -> new RuntimeException("Could not create or find category: " + name));
                    }
                });
    }
}
