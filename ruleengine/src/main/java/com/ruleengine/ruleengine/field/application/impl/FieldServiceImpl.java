package com.ruleengine.ruleengine.field.application.impl;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ruleengine.ruleengine.common.error.ResourceNotFoundException;
import com.ruleengine.ruleengine.common.error.RuleValidationException;
import com.ruleengine.ruleengine.field.api.dto.FieldCreateRequest;
import com.ruleengine.ruleengine.field.api.dto.FieldResponse;
import com.ruleengine.ruleengine.field.application.FieldService;
import com.ruleengine.ruleengine.field.infrastructure.FieldDefinitionEntity;
import com.ruleengine.ruleengine.field.infrastructure.FieldDefinitionRepository;
import com.ruleengine.ruleengine.field.infrastructure.FieldMapper;
import com.ruleengine.ruleengine.rule.validation.RuleFieldValidator;

@Service
@Transactional
public class FieldServiceImpl implements FieldService {

    private final FieldDefinitionRepository fieldRepository;
    private final FieldMapper fieldMapper;
    private final RuleFieldValidator fieldValidator;

    public FieldServiceImpl(
            FieldDefinitionRepository fieldRepository,
            FieldMapper fieldMapper,
            RuleFieldValidator fieldValidator) {
        this.fieldRepository = fieldRepository;
        this.fieldMapper = fieldMapper;
        this.fieldValidator = fieldValidator;
    }

    @Override
    public FieldResponse createField(FieldCreateRequest request) {
        fieldValidator.validateFieldDefinition(request);
        if (fieldRepository.existsByNameIgnoreCase(request.name())) {
            throw new RuleValidationException("Field name already exists");
        }
        FieldDefinitionEntity saved = fieldRepository.save(fieldMapper.toEntity(request));
        return fieldMapper.toResponse(saved);
    }

    @Override
    public FieldResponse updateField(UUID id, FieldCreateRequest request) {
        fieldValidator.validateFieldDefinition(request);
        FieldDefinitionEntity entity = fieldRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Field", id));

        if (!entity.getName().equalsIgnoreCase(request.name()) && fieldRepository.existsByNameIgnoreCase(request.name())) {
            throw new RuleValidationException("Field name already exists");
        }

        entity.setName(request.name());
        entity.setLabel(request.label());
        entity.setType(request.type());
        entity.setRequired(request.required());
        entity.setAllowedValues(request.allowedValues());

        FieldDefinitionEntity updated = fieldRepository.save(entity);
        return fieldMapper.toResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FieldResponse> getFields() {
        return fieldRepository.findAll().stream()
                .sorted(Comparator.comparing(FieldDefinitionEntity::getName))
                .map(fieldMapper::toResponse)
                .toList();
    }

    @Override
    public void deleteField(UUID id) {
        FieldDefinitionEntity entity = fieldRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Field", id));
        fieldRepository.delete(entity);
    }
}
