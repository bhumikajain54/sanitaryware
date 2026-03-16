package com.example.sanitary.ware.backend.services;

import com.example.sanitary.ware.backend.dto.PageRequestDTO;
import com.example.sanitary.ware.backend.entities.CMSPage;
import com.example.sanitary.ware.backend.repositories.CMSPageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CMSPageService {

    private final CMSPageRepository pageRepository;

    public List<CMSPage> getAllPages() {
        return pageRepository.findAll();
    }

    public CMSPage getPageBySlug(String slug) {
        return pageRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Page not found with slug: " + slug));
    }

    public CMSPage createPage(PageRequestDTO dto) {
        CMSPage page = CMSPage.builder()
                .title(dto.getTitle())
                .slug(dto.getSlug() != null ? dto.getSlug() : generateSlug(dto.getTitle()))
                .type(dto.getType())
                .status(dto.getStatus())
                .content(dto.getContent())
                .metaDescription(dto.getMetaDescription())
                .active(dto.isActive())
                .build();
        return pageRepository.save(page);
    }

    public CMSPage updatePage(Long id, PageRequestDTO dto) {
        CMSPage page = pageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Page not found with id: " + id));

        page.setTitle(dto.getTitle());
        if (dto.getSlug() != null)
            page.setSlug(dto.getSlug());
        page.setType(dto.getType());
        page.setStatus(dto.getStatus());
        page.setContent(dto.getContent());
        page.setMetaDescription(dto.getMetaDescription());
        page.setActive(dto.isActive());

        return pageRepository.save(page);
    }

    public void deletePage(Long id) {
        pageRepository.deleteById(id);
    }

    private String generateSlug(String title) {
        if (title == null)
            return "page-" + System.currentTimeMillis();
        return title.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
    }
}
