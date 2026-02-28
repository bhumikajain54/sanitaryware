package com.example.sanitary.ware.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/debug/db")
public class DbStructureController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/columns")
    public List<Map<String, Object>> getColumns() {
        return jdbcTemplate.queryForList("SHOW COLUMNS FROM cms_pages");
    }
}
