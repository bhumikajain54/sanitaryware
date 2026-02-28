package com.example.sanitary.ware.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/debug/db")
public class DbDebugController {

    @Autowired
    private DataSource dataSource;

    @GetMapping("/schema")
    public ResponseEntity<List<Map<String, Object>>> getSchema() throws Exception {
        List<Map<String, Object>> tables = new ArrayList<>();
        try (var connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();
            try (ResultSet rs = metaData.getTables(null, null, "%", new String[] { "TABLE" })) {
                while (rs.next()) {
                    String tableName = rs.getString("TABLE_NAME");
                    Map<String, Object> tableInfo = new HashMap<>();
                    tableInfo.put("table", tableName);

                    List<String> columns = new ArrayList<>();
                    try (ResultSet crs = metaData.getColumns(null, null, tableName, null)) {
                        while (crs.next()) {
                            columns.add(crs.getString("COLUMN_NAME"));
                        }
                    }
                    tableInfo.put("columns", columns);
                    tables.add(tableInfo);
                }
            }
        }
        return ResponseEntity.ok(tables);
    }
}
