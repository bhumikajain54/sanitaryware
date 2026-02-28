package com.example.sanitary.ware.backend.services;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;

import com.example.sanitary.ware.backend.dto.ProductCsvDTO;
import com.example.sanitary.ware.backend.dto.ProductResponseDTO;
import com.example.sanitary.ware.backend.entities.Product;
import com.example.sanitary.ware.backend.entities.Brand;
import com.example.sanitary.ware.backend.entities.Category;
import com.example.sanitary.ware.backend.repositories.ProductRepository;
import com.example.sanitary.ware.backend.repositories.BrandRepository;
import com.example.sanitary.ware.backend.repositories.CategoryRepository;
import com.opencsv.bean.CsvToBean;
import com.opencsv.bean.CsvToBeanBuilder;
import com.opencsv.bean.HeaderColumnNameMappingStrategy;
import com.opencsv.bean.StatefulBeanToCsv;
import com.opencsv.bean.StatefulBeanToCsvBuilder;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.lang.NonNull;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PushbackInputStream;
import java.io.Writer;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private static final Logger logger = LoggerFactory.getLogger(ProductService.class);

    private final ProductRepository productRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final ActivityLogService activityLogService;
    private final Validator validator;
    private final CategoryService categoryService;
    private final BrandService brandService;

    // Convert Product entity to DTO
    @SuppressWarnings("unused")
    private ProductResponseDTO convertToDTO(Product product) {
        return ProductResponseDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .price(product.getPrice())
                .stockQuantity(product.getStockQuantity())
                .mainImage(product.getMainImage())
                .active(product.getActive())
                .featured(product.getFeatured())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .brandId(product.getBrand() != null ? product.getBrand().getId() : null)
                .brandName(product.getBrand() != null ? product.getBrand().getName() : null)
                .build();
    }

    public List<String> importProducts(MultipartFile file) throws Exception {
        int initialCount = (int) productRepository.count();
        String filename = file.getOriginalFilename();
        logger.info("Starting product import from file: {}", filename);

        List<String> results;
        if (filename != null && filename.toLowerCase().endsWith(".pdf")) {
            results = importProductsFromPdf(file);
        } else if (filename != null
                && (filename.toLowerCase().endsWith(".xls") || filename.toLowerCase().endsWith(".xlsx"))) {
            results = importProductsFromExcel(file);
        } else {
            results = importProductsFromCsv(file);
        }

        int finalCount = (int) productRepository.count();
        int imported = finalCount - initialCount;
        results.add(0, "SUCCESS: " + imported + " products created/updated successfully.");
        return results;
    }

    private List<String> importProductsFromPdf(MultipartFile file) throws Exception {
        List<String> errors = new ArrayList<>();
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            String[] lines = text.split("\\r?\\n");

            String inferredBrand = "";
            // 1. Look for Brand/Catalogue header in the first few lines
            for (int i = 0; i < Math.min(20, lines.length); i++) {
                String line = lines[i].toUpperCase();
                if (line.contains("CERA"))
                    inferredBrand = "CERA";
                else if (line.contains("AQUARIUM"))
                    inferredBrand = "AQUARIUM";
                else if (line.contains("AQUAGOLD"))
                    inferredBrand = "AQUAGOLD";
                else if (line.contains("PLASTO"))
                    inferredBrand = "PLASTO";
                else if (line.contains("WATERFLO"))
                    inferredBrand = "WATERFLO";
                if (!inferredBrand.isEmpty())
                    break;
            }

            // 2. If still not found, check filename
            if (inferredBrand.isEmpty() && file.getOriginalFilename() != null) {
                String fn = file.getOriginalFilename().toUpperCase();
                if (fn.contains("CERA"))
                    inferredBrand = "CERA";
                else if (fn.contains("AQUARIUM"))
                    inferredBrand = "AQUARIUM";
                else if (fn.contains("AQUAGOLD"))
                    inferredBrand = "AQUAGOLD";
                else if (fn.contains("PLASTO"))
                    inferredBrand = "PLASTO";
                else if (fn.contains("WATERFLO"))
                    inferredBrand = "WATERFLO";
            }

            if (!inferredBrand.isEmpty()) {
                logger.info("Identified brand '{}' for PDF import.", inferredBrand);
            } else {
                logger.warn("No specific brand identified for PDF: {}", file.getOriginalFilename());
            }

            int rowIndex = 0;
            for (String line : lines) {
                rowIndex++;
                String trimmedLine = line.trim();

                // SKIP CRITICAL NON-PRODUCT LINES (Noise Reduction)
                if (trimmedLine.isEmpty() ||
                        trimmedLine.contains("@") || // Skip emails
                        trimmedLine.matches(".*\\d{10,}.*") || // Skip phone numbers
                        trimmedLine.toLowerCase().contains("showroom") ||
                        trimmedLine.toLowerCase().contains("office") ||
                        trimmedLine.toLowerCase().contains("tel:") ||
                        trimmedLine.toLowerCase().contains("fax:") ||
                        trimmedLine.toLowerCase().contains("e-mail") ||
                        trimmedLine.toLowerCase().contains("website") ||
                        trimmedLine.toLowerCase().contains("address")) {
                    continue;
                }

                try {
                    String[] parts = trimmedLine.split("[,\\t]|  +");
                    if (parts.length >= 1) {
                        ProductCsvDTO dto = new ProductCsvDTO();
                        dto.setBrand(inferredBrand);

                        // Smarter Data Extraction
                        distributePdfParts(parts, dto);

                        // Skip if we couldn't even find a name
                        if (dto.getName() == null || dto.getName().length() < 3) {
                            continue;
                        }

                        // Reuse the central processing logic (ID -> SKU -> Name)
                        processProductDto(dto, rowIndex, errors);
                    }
                } catch (Exception e) {
                    errors.add("Line " + rowIndex + ": " + e.getMessage());
                }
            }
        }
        return errors;
    }

    private void distributePdfParts(String[] parts, ProductCsvDTO dto) {
        // 1. Identify Price (usually the last numeric token)
        int priceIndex = -1;
        for (int i = parts.length - 1; i >= 0; i--) {
            String p = parts[i].trim();
            if (isLikelyPrice(p)) {
                priceIndex = i;
                dto.setPrice(p);
                break;
            }
        }

        // 2. Collect remaining tokens
        List<String> others = new ArrayList<>();
        for (int i = 0; i < parts.length; i++) {
            if (i != priceIndex && !parts[i].trim().isEmpty()) {
                others.add(parts[i].trim());
            }
        }

        if (!others.isEmpty()) {
            dto.setName(String.join(" ", others));
        }
    }

    private boolean isLikelyPrice(String s) {
        if (s == null || s.isEmpty())
            return false;
        String cleaned = s.trim().replaceAll("[₹, ]", "");
        if (cleaned.isEmpty())
            return false;
        try {
            Double.parseDouble(cleaned);
            // Sane price check: prices are usually > 0
            double p = Double.parseDouble(cleaned);
            return p > 0;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    private List<String> importProductsFromCsv(MultipartFile file) throws Exception {
        List<String> errors = new ArrayList<>();
        InputStream is = file.getInputStream();
        PushbackInputStream pbis = new PushbackInputStream(is, 3);
        byte[] bom = new byte[3];
        int n = pbis.read(bom, 0, bom.length);
        if (n == 3 && bom[0] == (byte) 0xEF && bom[1] == (byte) 0xBB && bom[2] == (byte) 0xBF) {
            // Found BOM, skip it (already read)
        } else if (n > 0) {
            pbis.unread(bom, 0, n);
        }

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(pbis, StandardCharsets.UTF_8))) {
            HeaderColumnNameMappingStrategy<ProductCsvDTO> strategy = new HeaderColumnNameMappingStrategy<>();
            strategy.setType(ProductCsvDTO.class);

            CsvToBean<ProductCsvDTO> csvToBean = new CsvToBeanBuilder<ProductCsvDTO>(reader)
                    .withMappingStrategy(strategy)
                    .withIgnoreEmptyLine(true)
                    .withThrowExceptions(false)
                    .build();

            Iterator<ProductCsvDTO> iterator = csvToBean.iterator();

            int rowIndex = 1;
            while (iterator.hasNext()) {
                rowIndex++;
                ProductCsvDTO dto = null;
                try {
                    dto = iterator.next();
                } catch (Exception e) {
                    errors.add("Row " + rowIndex + ": Parsing error - " + e.getMessage());
                    continue;
                }
                processProductDto(dto, rowIndex, errors);
            }
            csvToBean.getCapturedExceptions()
                    .forEach(e -> errors.add("Line " + e.getLineNumber() + ": " + e.getMessage()));
        }
        return errors;
    }

    private void processProductDto(ProductCsvDTO dto, int rowIndex, List<String> errors) {
        if (dto == null)
            return;

        Set<ConstraintViolation<ProductCsvDTO>> violations = validator.validate(dto);
        if (!violations.isEmpty()) {
            String errorMessage = violations.stream()
                    .map(ConstraintViolation::getMessage)
                    .collect(Collectors.joining(", "));
            errors.add("Row " + rowIndex + ": " + errorMessage);
            return;
        }

        try {
            Optional<Product> productOpt = Optional.empty();

            // 1. Try matching by ID first if provided
            if (dto.getId() != null && !dto.getId().trim().isEmpty()) {
                try {
                    Long id = Long.parseLong(dto.getId().trim());
                    productOpt = productRepository.findById(id);
                } catch (NumberFormatException e) {
                    logger.warn("Invalid product ID in import: {}", dto.getId());
                }
            }

            // 2. Fallback to matching by Name (Case-Insensitive)
            if (productOpt.isEmpty() && dto.getName() != null && !dto.getName().trim().isEmpty()) {
                productOpt = productRepository.findByNameIgnoreCase(dto.getName().trim());
            }

            Product product = productOpt.orElse(new Product());

            // 3. Update fields ONLY if provided in the DTO (Partial Update / Merge)
            if (dto.getName() != null && !dto.getName().trim().isEmpty()) {
                product.setName(dto.getName().trim());
            }

            if (dto.getPrice() != null && !dto.getPrice().trim().isEmpty()) {
                product.setPrice(cleanAndParsePrice(dto.getPrice()));
            } else if (product.getId() == null) {
                // New product without price info gets 0.0
                product.setPrice(0.0);
            }

            if (dto.getStockQuantity() != null && !dto.getStockQuantity().trim().isEmpty()) {
                try {
                    product.setStockQuantity(Integer.parseInt(dto.getStockQuantity().trim()));
                } catch (NumberFormatException e) {
                    errors.add("Row " + rowIndex + ": Invalid Stock format - " + dto.getStockQuantity());
                }
            } else if (product.getId() == null) {
                // New product without stock info gets 0
                product.setStockQuantity(0);
            }

            if (dto.getMainImage() != null && !dto.getMainImage().trim().isEmpty()) {
                product.setMainImage(dto.getMainImage().trim());
            }

            if (dto.getActive() != null && !dto.getActive().trim().isEmpty()) {
                product.setActive(Boolean.parseBoolean(dto.getActive().trim()));
            }

            if (dto.getFeatured() != null && !dto.getFeatured().trim().isEmpty()) {
                product.setFeatured(Boolean.parseBoolean(dto.getFeatured().trim()));
            }

            // Auto-create/resolve brand
            if (dto.getBrand() != null && !dto.getBrand().trim().isEmpty()) {
                Brand brand = brandService.getOrCreateByName(dto.getBrand().trim());
                product.setBrand(brand);
            }

            // Auto-create/resolve category
            if (dto.getCategory() != null && !dto.getCategory().trim().isEmpty()) {
                product.setCategory(categoryService.getOrCreateByName(dto.getCategory().trim()));
            } else if (product.getCategory() == null) {
                // Smart Inference
                String inferred = inferCategoryFromName(product.getName());
                product.setCategory(categoryService.getOrCreateByName(inferred));
            }

            // Validate and save
            if (product.getName() == null || product.getName().isEmpty()) {
                errors.add("Row " + rowIndex + ": Product name is missing and could not be resolved.");
                return;
            }

            productRepository.save(product);
        } catch (Exception e) {
            errors.add("Row " + rowIndex + ": Unexpected error - " + e.getMessage());
            logger.error("Error processing import row {}: ", rowIndex, e);
        }
    }

    private List<String> importProductsFromExcel(MultipartFile file) throws Exception {
        List<String> errors = new ArrayList<>();
        try (InputStream is = file.getInputStream();
                org.apache.poi.ss.usermodel.Workbook workbook = org.apache.poi.ss.usermodel.WorkbookFactory
                        .create(is)) {
            org.apache.poi.ss.usermodel.Sheet sheet = workbook.getSheetAt(0);
            org.apache.poi.ss.usermodel.Row headerRow = sheet.getRow(0);
            if (headerRow == null) {
                errors.add("Excel file is empty");
                return errors;
            }

            Map<String, Integer> headerMap = new HashMap<>();
            for (org.apache.poi.ss.usermodel.Cell cell : headerRow) {
                headerMap.put(cell.getStringCellValue().trim(), cell.getColumnIndex());
            }

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                org.apache.poi.ss.usermodel.Row row = sheet.getRow(i);
                if (row == null)
                    continue;

                ProductCsvDTO dto = new ProductCsvDTO();
                dto.setName(getCellValue(row, findHeader(headerMap, "Name", "name", "Product Name")));
                dto.setPrice(getCellValue(row, findHeader(headerMap, "Price", "price", "Rate")));
                dto.setStockQuantity(getCellValue(row,
                        findHeader(headerMap, "StockQuantity", "Stock", "Quantity", "stock", "quantity")));
                dto.setMainImage(getCellValue(row, findHeader(headerMap, "MainImage", "Main Image", "image")));
                dto.setCategory(getCellValue(row, findHeader(headerMap, "Category", "category")));
                dto.setBrand(getCellValue(row, findHeader(headerMap, "Brand", "brand")));
                dto.setActive(getCellValue(row, findHeader(headerMap, "Active", "active")));
                dto.setFeatured(getCellValue(row, findHeader(headerMap, "Featured", "featured", "isFeatured")));

                if (dto.getName() == null || dto.getName().isEmpty())
                    continue;

                processProductDto(dto, i + 1, errors);
            }
        }
        return errors;
    }

    private Integer findHeader(Map<String, Integer> headerMap, String... names) {
        if (headerMap == null)
            return null;
        for (String name : names) {
            // Try exact match
            if (headerMap.containsKey(name))
                return headerMap.get(name);
            // Try case-insensitive match
            for (String key : headerMap.keySet()) {
                if (key.equalsIgnoreCase(name))
                    return headerMap.get(key);
            }
        }
        return null;
    }

    private String inferCategoryFromName(String name) {
        if (name == null)
            return "General";
        String n = name.toUpperCase();
        if (n.contains("EWC") || n.contains("TOILET") || n.contains("ONE PIECE") || n.contains("WALL HUNG"))
            return "EWC / Toilet";
        if (n.contains("WASH BASIN") || n.contains("BASIN") || n.contains("SINK"))
            return "Wash Basin";
        if (n.contains("FAUCET") || n.contains("MIXER") || n.contains("TAP") || n.contains("COCK"))
            return "Faucets";
        if (n.contains("SHOWER") || n.contains("HAND SHOWER"))
            return "Showers";
        if (n.contains("URINAL"))
            return "Urinals";
        if (n.contains("CISTERN"))
            return "Cisterns";
        if (n.contains("SEAT COVER"))
            return "Seat Covers";
        if (n.contains("MIRROR"))
            return "Mirrors";
        if (n.contains("BATH TUB"))
            return "Bath Tubs";
        return "Sanitaryware";
    }

    private Double cleanAndParsePrice(String priceStr) {
        if (priceStr == null || priceStr.trim().isEmpty() || priceStr.trim().equalsIgnoreCase("NULL")
                || priceStr.trim().equalsIgnoreCase("N/A") || priceStr.trim().equalsIgnoreCase("NIL"))
            return 0.0;
        try {
            // Remove ₹, commas, and any non-numeric characters except the decimal point
            String cleaned = priceStr.trim().replaceAll("[₹, ]", "");
            if (cleaned.isEmpty())
                return 0.0;
            return Double.parseDouble(cleaned);
        } catch (NumberFormatException e) {
            logger.warn("Could not parse price value: {}", priceStr);
            return 0.0;
        }
    }

    private String getCellValue(org.apache.poi.ss.usermodel.Row row, Integer columnIndex) {
        if (columnIndex == null)
            return null;
        org.apache.poi.ss.usermodel.Cell cell = row.getCell(columnIndex);
        if (cell == null)
            return null;

        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (org.apache.poi.ss.usermodel.DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                } else {
                    double val = cell.getNumericCellValue();
                    if (val == (long) val) {
                        return String.valueOf((long) val);
                    }
                    return String.valueOf(val);
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                try {
                    return String.valueOf(cell.getNumericCellValue());
                } catch (Exception e) {
                    return cell.getCellFormula();
                }
            case BLANK:
                return "";
            default:
                return null;
        }
    }

    public void exportProducts(Writer writer) throws Exception {
        List<Product> products = productRepository.findAll();
        List<ProductCsvDTO> dtos = products.stream().map(p -> {
            return new ProductCsvDTO(
                    p.getId() != null ? String.valueOf(p.getId()) : null,
                    p.getName(),
                    p.getPrice() != null ? String.valueOf(p.getPrice()) : "",
                    p.getStockQuantity() != null ? String.valueOf(p.getStockQuantity()) : "",
                    p.getMainImage(),
                    p.getCategory() != null ? p.getCategory().getName() : null,
                    p.getBrand() != null ? p.getBrand().getName() : null,
                    String.valueOf(Boolean.TRUE.equals(p.getActive())),
                    String.valueOf(Boolean.TRUE.equals(p.getFeatured())));
        }).collect(Collectors.toList());

        StatefulBeanToCsv<ProductCsvDTO> beanToCsv = new StatefulBeanToCsvBuilder<ProductCsvDTO>(writer)
                .withApplyQuotesToAll(false)
                .build();
        beanToCsv.write(dtos);
    }

    public void exportProductsToPdf(HttpServletResponse response) throws Exception {
        List<Product> products = productRepository.findAll();

        Document document = new Document(PageSize.A4.rotate());
        PdfWriter.getInstance(document, response.getOutputStream());

        document.open();
        com.lowagie.text.Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
        font.setSize(18);

        Paragraph p = new Paragraph("Product List", font);
        p.setAlignment(Paragraph.ALIGN_CENTER);
        document.add(p);

        PdfPTable table = new PdfPTable(7);
        table.setWidthPercentage(100f);
        table.setWidths(new float[] { 2.0f, 3.0f, 2.0f, 2.0f, 1.5f, 1.5f, 1.5f });
        table.setSpacingBefore(10);

        writeTableHeader(table);
        writeTableData(table, products);

        document.add(table);
        document.close();
    }

    private void writeTableHeader(PdfPTable table) {
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(new java.awt.Color(245, 247, 249)); // Light grey background like the image
        cell.setPadding(8);
        cell.setBorderColor(new java.awt.Color(222, 226, 230));

        com.lowagie.text.Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
        font.setColor(new java.awt.Color(108, 117, 125)); // Muted text color
        font.setSize(10);

        cell.setPhrase(new Phrase("IMAGE", font));
        table.addCell(cell);

        cell.setPhrase(new Phrase("PRODUCT", font));
        table.addCell(cell);

        cell.setPhrase(new Phrase("BRAND", font));
        table.addCell(cell);

        cell.setPhrase(new Phrase("CATEGORY", font));
        table.addCell(cell);

        cell.setPhrase(new Phrase("PRICE", font));
        table.addCell(cell);

        cell.setPhrase(new Phrase("STOCK", font));
        table.addCell(cell);

        cell.setPhrase(new Phrase("STATUS", font));
        table.addCell(cell);
    }

    private void writeTableData(PdfPTable table, List<Product> products) {
        com.lowagie.text.Font font = FontFactory.getFont(FontFactory.HELVETICA);
        font.setSize(10);
        font.setColor(new java.awt.Color(33, 37, 41));

        for (Product product : products) {
            // Image Cell
            PdfPCell imageCell = new PdfPCell();
            imageCell.setPadding(3);
            if (product.getMainImage() != null && !product.getMainImage().isEmpty()) {
                try {
                    com.lowagie.text.Image img = com.lowagie.text.Image.getInstance(product.getMainImage());
                    img.scaleToFit(50, 50);
                    imageCell.addElement(img);
                } catch (Exception e) {
                    imageCell.setPhrase(new Phrase("No Image", font));
                }
            } else {
                imageCell.setPhrase(new Phrase("-", font));
            }
            table.addCell(imageCell);

            table.addCell(new Phrase(product.getName() != null ? product.getName() : "-", font));
            table.addCell(new Phrase(product.getBrand() != null ? product.getBrand().getName() : "-", font));
            table.addCell(new Phrase(product.getCategory() != null ? product.getCategory().getName() : "-", font));
            table.addCell(new Phrase(String.valueOf(product.getPrice()), font));
            table.addCell(new Phrase(String.valueOf(product.getStockQuantity()), font));
            table.addCell(new Phrase(Boolean.TRUE.equals(product.getActive()) ? "Active" : "Inactive", font));
        }
    }

    @Cacheable(value = "products", key = "#query + '_' + #categoryId + '_' + #brandId + '_' + #minPrice + '_' + #maxPrice + '_' + #page + '_' + #size")
    public Page<Product> getAllProducts(String query, Long categoryId, Long brandId, Double minPrice, Double maxPrice,
            int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productRepository.searchProducts(query, categoryId, brandId, minPrice, maxPrice, pageable);
    }

    public Product getProductById(@NonNull Long id) {
        return productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
    }

    @Cacheable(value = "productsByCategory", key = "#categoryId")
    public List<Product> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }

    @Cacheable(value = "productsByBrand", key = "#brandId")
    public List<Product> getProductsByBrand(Long brandId) {
        return productRepository.findByBrandId(brandId);
    }

    @Cacheable(value = "featuredProducts")
    public List<Product> getFeaturedProducts() {
        return productRepository.findByFeaturedTrue();
    }

    public List<Product> searchProductsByName(String query) {
        return productRepository.searchByName(query);
    }

    public List<com.example.sanitary.ware.backend.dto.ProductSuggestionDTO> getProductSuggestions(String query) {
        List<Product> products = productRepository.searchByName(query);
        return products.stream().map(p -> com.example.sanitary.ware.backend.dto.ProductSuggestionDTO.builder()
                .id(p.getId())
                .name(p.getName())
                .price(p.getPrice())
                .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                .brandName(p.getBrand() != null ? p.getBrand().getName() : null)
                .build()).collect(Collectors.toList());
    }

    // Admin Methods
    @Transactional
    @CacheEvict(value = { "products", "productsByCategory", "productsByBrand", "featuredProducts" }, allEntries = true)
    public Product createProduct(@NonNull Product product) {
        if (product.getName() == null || product.getName().trim().isEmpty()) {
            throw new RuntimeException("Product name is required");
        }

        String normalizedName = product.getName().trim();
        product.setName(normalizedName);

        // Prevent duplicate by name
        Optional<Product> existing = productRepository.findByNameIgnoreCase(normalizedName);
        if (existing.isPresent()) {
            return existing.get(); // Return existing instead of creating duplicate
        }

        resolveEntities(product);
        Product saved = productRepository.save(product);
        activityLogService.log(1L, "admin@example.com", "CREATE_PRODUCT", "PRODUCTS", "Created: " + saved.getName());
        return saved;
    }

    @Transactional
    @CacheEvict(value = { "products", "productsByCategory", "productsByBrand", "featuredProducts" }, allEntries = true)
    public Product updateProduct(Long id, Product product) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        if (product.getName() != null)
            existingProduct.setName(product.getName());
        if (product.getPrice() != null)
            existingProduct.setPrice(product.getPrice());

        if (product.getStockQuantity() != null) {
            logger.info("Updating stock for product ID {}: {} -> {}", id, existingProduct.getStockQuantity(),
                    product.getStockQuantity());
            existingProduct.setStockQuantity(product.getStockQuantity());
        } else {
            logger.debug("No stock quantity provided in update request for product ID {}", id);
        }

        if (product.getMainImage() != null)
            existingProduct.setMainImage(product.getMainImage());

        if (product.getActive() != null)
            existingProduct.setActive(product.getActive());

        if (product.getFeatured() != null)
            existingProduct.setFeatured(product.getFeatured());

        // Resolve and set Category
        if (product.getCategory() != null) {
            existingProduct.setCategory(resolveCategory(product.getCategory()));
        }

        // Resolve and set Brand
        if (product.getBrand() != null) {
            existingProduct.setBrand(resolveBrand(product.getBrand()));
        }

        Product saved = productRepository.save(existingProduct);
        activityLogService.log(1L, "admin@example.com", "UPDATE_PRODUCT", "PRODUCTS", "Updated: " + saved.getName());
        return saved;
    }

    private Category resolveCategory(Category category) {
        if (category == null)
            return null;
        if (category.getId() != null) {
            return categoryRepository.findById(category.getId()).orElse(null);
        } else if (category.getName() != null) {
            return categoryRepository.findByName(category.getName()).orElse(null);
        }
        return null;
    }

    private Brand resolveBrand(Brand brand) {
        if (brand == null)
            return null;
        if (brand.getId() != null) {
            return brandRepository.findById(brand.getId()).orElse(null);
        } else if (brand.getName() != null) {
            return brandRepository.findByName(brand.getName()).orElse(null);
        }
        return null;
    }

    private void resolveEntities(Product product) {
        if (product.getCategory() != null) {
            product.setCategory(resolveCategory(product.getCategory()));
        }
        if (product.getBrand() != null) {
            product.setBrand(resolveBrand(product.getBrand()));
        }
    }

    @Transactional
    @CacheEvict(value = { "products", "productsByCategory", "productsByBrand", "featuredProducts" }, allEntries = true)
    public void deleteProduct(@NonNull Long id) {
        productRepository.deleteById(id);
        activityLogService.log(1L, "admin@example.com", "DELETE_PRODUCT", "PRODUCTS", "Deleted ID: " + id);
    }

    @Transactional
    public Product updateStock(Long id, Integer quantity) {
        Product product = getProductById(id);
        product.setStockQuantity(quantity);
        Product saved = productRepository.save(product);
        activityLogService.log(1L, "admin@example.com", "UPDATE_STOCK", "PRODUCTS",
                "Updated stock for " + saved.getName() + " to " + quantity);
        return saved;
    }

    @Transactional
    public void incrementStock(Long productId, Integer quantity) {
        productRepository.findById(productId).ifPresentOrElse(product -> {
            int currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
            product.setStockQuantity(currentStock + quantity);
            productRepository.save(product);
            logger.info("Incremented stock for product ID: {} ({}) by {}. New stock: {}", productId, product.getName(),
                    quantity,
                    product.getStockQuantity());
        }, () -> logger.warn("Could not find product with ID: {} to increment stock", productId));
    }

    @Transactional
    public void decrementStock(Long productId, Integer quantity) {
        productRepository.findById(productId).ifPresentOrElse(product -> {
            int currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
            product.setStockQuantity(currentStock - quantity);
            productRepository.save(product);
            logger.info("Decremented stock for product ID: {} ({}) by {}. New stock: {}", productId, product.getName(),
                    quantity,
                    product.getStockQuantity());
        }, () -> logger.warn("Could not find product with ID: {} to decrement stock", productId));
    }

    @Transactional
    public void incrementStock(String productName, Integer quantity) {
        productRepository.findByName(productName).ifPresentOrElse(product -> {
            int currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
            product.setStockQuantity(currentStock + quantity);
            productRepository.save(product);
            logger.info("Incremented stock for product: {} by {}. New stock: {}", productName, quantity,
                    product.getStockQuantity());
        }, () -> logger.warn("Could not find product with name: '{}' to increment stock", productName));
    }

    @Transactional
    public void decrementStock(String productName, Integer quantity) {
        productRepository.findByName(productName).ifPresentOrElse(product -> {
            int currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
            product.setStockQuantity(currentStock - quantity);
            productRepository.save(product);
            logger.info("Decremented stock for product: {} by {}. New stock: {}", productName, quantity,
                    product.getStockQuantity());
        }, () -> logger.warn("Could not find product with name: '{}' to decrement stock", productName));
    }

    @Transactional
    @CacheEvict(value = { "products", "productsByCategory", "productsByBrand", "featuredProducts" }, allEntries = true)
    public int updateAllStock(Integer quantity) {
        int updatedCount = productRepository.updateAllStockQuantity(quantity);
        activityLogService.log(1L, "admin@example.com", "BULK_UPDATE_STOCK", "PRODUCTS",
                "Updated stock for all " + updatedCount + " products to " + quantity);
        return updatedCount;
    }
}
