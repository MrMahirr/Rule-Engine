package com.ruleengine.ruleengine.field.api.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.ruleengine.ruleengine.field.domain.FieldType;

public record FieldResponse(
        UUID id,
        String name,
        String label,
        FieldType type,
        boolean required,
        List<String> allowedValues,
        Instant createdAt,
        Instant updatedAt) {

    public FieldResponse {
        allowedValues = allowedValues == null ? List.of() : List.copyOf(allowedValues);
    }
}
