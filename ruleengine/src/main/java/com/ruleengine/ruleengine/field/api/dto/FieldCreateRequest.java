package com.ruleengine.ruleengine.field.api.dto;

import java.util.List;

import com.ruleengine.ruleengine.field.domain.FieldType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record FieldCreateRequest(
        @NotBlank String name,
        @NotBlank String label,
        @NotNull FieldType type,
        boolean required,
        List<String> allowedValues) {

    public FieldCreateRequest {
        allowedValues = allowedValues == null ? List.of() : List.copyOf(allowedValues);
    }
}
