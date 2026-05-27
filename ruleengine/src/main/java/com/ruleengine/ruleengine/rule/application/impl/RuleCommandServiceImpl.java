package com.ruleengine.ruleengine.rule.application.impl;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ruleengine.ruleengine.common.error.ResourceNotFoundException;
import com.ruleengine.ruleengine.common.error.RuleValidationException;
import com.ruleengine.ruleengine.field.infrastructure.FieldDefinitionRepository;
import com.ruleengine.ruleengine.rule.api.dto.RuleCreateRequest;
import com.ruleengine.ruleengine.rule.api.dto.RuleResponse;
import com.ruleengine.ruleengine.rule.api.dto.RuleToggleRequest;
import com.ruleengine.ruleengine.rule.api.dto.RuleUpdateRequest;
import com.ruleengine.ruleengine.rule.application.RuleCommandService;
import com.ruleengine.ruleengine.rule.infrastructure.cache.RuleCacheKeys;
import com.ruleengine.ruleengine.rule.infrastructure.mapper.RuleMapper;
import com.ruleengine.ruleengine.rule.infrastructure.persistence.RuleDefinitionEntity;
import com.ruleengine.ruleengine.rule.infrastructure.persistence.RuleDefinitionRepository;
import com.ruleengine.ruleengine.rule.infrastructure.persistence.RuleVersionEntity;
import com.ruleengine.ruleengine.rule.infrastructure.persistence.RuleVersionRepository;
import com.ruleengine.ruleengine.rule.validation.RuleAstValidator;
import com.ruleengine.ruleengine.rule.validation.RuleFieldValidator;

@Service
@Transactional
public class RuleCommandServiceImpl implements RuleCommandService {

    private final RuleDefinitionRepository ruleRepository;
    private final FieldDefinitionRepository fieldRepository;
    private final RuleVersionRepository versionRepository;
    private final RuleConflictAnalyzer conflictAnalyzer;
    private final RuleMapper ruleMapper;
    private final RuleAstValidator astValidator;
    private final RuleFieldValidator fieldValidator;

    public RuleCommandServiceImpl(
            RuleDefinitionRepository ruleRepository,
            FieldDefinitionRepository fieldRepository,
            RuleVersionRepository versionRepository,
            RuleConflictAnalyzer conflictAnalyzer,
            RuleMapper ruleMapper,
            RuleAstValidator astValidator,
            RuleFieldValidator fieldValidator) {
        this.ruleRepository = ruleRepository;
        this.fieldRepository = fieldRepository;
        this.versionRepository = versionRepository;
        this.conflictAnalyzer = conflictAnalyzer;
        this.ruleMapper = ruleMapper;
        this.astValidator = astValidator;
        this.fieldValidator = fieldValidator;
    }

    @Override
    @CacheEvict(cacheNames = {RuleCacheKeys.ACTIVE_RULES, RuleCacheKeys.RULE_BY_ID}, allEntries = true)
    public RuleResponse createRule(RuleCreateRequest request) {
        astValidator.validate(request.ast());
        astValidator.validateActions(request.actions());
        fieldValidator.validateAstFields(request.ast(), fieldRepository.findAll().stream()
                .map(field -> field.getName())
                .toList());

        if (ruleRepository.existsByNameIgnoreCase(request.name())) {
            throw new RuleValidationException("Rule name already exists");
        }

        RuleDefinitionEntity saved = ruleRepository.save(ruleMapper.toEntity(request));
        saveVersion(saved);
        conflictAnalyzer.analyzeAndSaveConflicts(saved.getId());
        
        return ruleMapper.toResponse(saved);
    }

    @Override
    @CacheEvict(cacheNames = {RuleCacheKeys.ACTIVE_RULES, RuleCacheKeys.RULE_BY_ID}, allEntries = true)
    public RuleResponse updateRule(UUID id, RuleUpdateRequest request) {
        RuleDefinitionEntity entity = getEntity(id);

        astValidator.validate(request.ast());
        astValidator.validateActions(request.actions());
        fieldValidator.validateAstFields(request.ast(), fieldRepository.findAll().stream()
                .map(field -> field.getName())
                .toList());

        if (!entity.getName().equalsIgnoreCase(request.name()) && ruleRepository.existsByNameIgnoreCase(request.name())) {
            throw new RuleValidationException("Rule name already exists");
        }

        entity.setName(request.name());
        entity.setDescription(request.description());
        entity.setCategory(request.category());
        entity.setPriority(request.priority());
        entity.setActive(Boolean.TRUE.equals(request.isActive()));
        entity.setAst(ruleMapper.toAstMap(request.ast()));
        entity.setActions(ruleMapper.toActionMaps(request.actions()));

        RuleDefinitionEntity saved = ruleRepository.save(entity);
        saveVersion(saved);
        conflictAnalyzer.analyzeAndSaveConflicts(saved.getId());
        
        return ruleMapper.toResponse(saved);
    }

    @Override
    @CacheEvict(cacheNames = {RuleCacheKeys.ACTIVE_RULES, RuleCacheKeys.RULE_BY_ID}, allEntries = true)
    public RuleResponse toggleRule(UUID id, RuleToggleRequest request) {
        RuleDefinitionEntity entity = getEntity(id);
        entity.setActive(Boolean.TRUE.equals(request.isActive()));
        RuleDefinitionEntity saved = ruleRepository.save(entity);
        conflictAnalyzer.analyzeAndSaveConflicts(saved.getId());
        return ruleMapper.toResponse(saved);
    }

    @Override
    @CacheEvict(cacheNames = {RuleCacheKeys.ACTIVE_RULES, RuleCacheKeys.RULE_BY_ID}, allEntries = true)
    public void deleteRule(UUID id) {
        RuleDefinitionEntity entity = getEntity(id);
        ruleRepository.delete(entity);
    }
    
    @Override
    @CacheEvict(cacheNames = {RuleCacheKeys.ACTIVE_RULES, RuleCacheKeys.RULE_BY_ID}, allEntries = true)
    public RuleResponse restoreVersion(UUID id, UUID versionId) {
        RuleDefinitionEntity entity = getEntity(id);
        RuleVersionEntity versionEntity = versionRepository.findById(versionId)
                .orElseThrow(() -> new ResourceNotFoundException("RuleVersion", versionId));
                
        entity.setAst(versionEntity.getAst());
        entity.setActions(versionEntity.getActions());
        
        RuleDefinitionEntity saved = ruleRepository.save(entity);
        saveVersion(saved);
        conflictAnalyzer.analyzeAndSaveConflicts(saved.getId());
        
        return ruleMapper.toResponse(saved);
    }

    private void saveVersion(RuleDefinitionEntity entity) {
        Integer maxVersion = versionRepository.findMaxVersionByRuleId(entity.getId());
        int newVersionNumber = (maxVersion == null ? 0 : maxVersion) + 1;
        
        RuleVersionEntity versionEntity = new RuleVersionEntity();
        versionEntity.setRuleId(entity.getId());
        versionEntity.setVersionNumber(newVersionNumber);
        versionEntity.setAst(entity.getAst());
        versionEntity.setActions(entity.getActions());
        versionEntity.setCreatedAt(LocalDateTime.now());
        
        versionRepository.save(versionEntity);
    }

    private RuleDefinitionEntity getEntity(UUID id) {
        return ruleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rule", id));
    }
}
