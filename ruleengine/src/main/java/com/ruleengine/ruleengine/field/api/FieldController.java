package com.ruleengine.ruleengine.field.api;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ruleengine.ruleengine.common.api.ApiResponse;
import com.ruleengine.ruleengine.field.api.dto.FieldCreateRequest;
import com.ruleengine.ruleengine.field.api.dto.FieldResponse;
import com.ruleengine.ruleengine.field.application.FieldService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/fields")
@Tag(name = "Fields", description = "Field definition endpoints")
public class FieldController {

    private final FieldService fieldService;

    public FieldController(FieldService fieldService) {
        this.fieldService = fieldService;
    }

    @GetMapping
    @Operation(summary = "List fields")
    public ApiResponse<List<FieldResponse>> getFields() {
        return ApiResponse.success("Fields retrieved", fieldService.getFields());
    }

    @PostMapping
    @Operation(summary = "Create field")
    public ResponseEntity<ApiResponse<FieldResponse>> createField(@Valid @RequestBody FieldCreateRequest request) {
        FieldResponse response = fieldService.createField(request);
        return ResponseEntity.created(URI.create("/api/fields/" + response.id()))
                .body(ApiResponse.success("Field created", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete field")
    public ApiResponse<Void> deleteField(@PathVariable UUID id) {
        fieldService.deleteField(id);
        return ApiResponse.success("Field deleted", null);
    }
}
