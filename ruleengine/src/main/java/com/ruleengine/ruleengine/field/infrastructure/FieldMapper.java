package com.ruleengine.ruleengine.field.infrastructure;

import org.springframework.stereotype.Component;

import com.ruleengine.ruleengine.field.api.dto.FieldCreateRequest;
import com.ruleengine.ruleengine.field.api.dto.FieldResponse;

@Component
public class FieldMapper {

    public FieldDefinitionEntity toEntity(FieldCreateRequest request) {
        FieldDefinitionEntity entity = new FieldDefinitionEntity();
        entity.setName(request.name());
        entity.setLabel(request.label());
        entity.setType(request.type());
        entity.setRequired(request.required());
        entity.setAllowedValues(request.allowedValues());
        return entity;
    }

    public FieldResponse toResponse(FieldDefinitionEntity entity) {
        return new FieldResponse(
                entity.getId(),
                entity.getName(),
                entity.getLabel(),
                entity.getType(),
                entity.isRequired(),
                entity.getAllowedValues(),
                entity.getCreatedAt(),
                entity.getUpdatedAt());
    }
}
