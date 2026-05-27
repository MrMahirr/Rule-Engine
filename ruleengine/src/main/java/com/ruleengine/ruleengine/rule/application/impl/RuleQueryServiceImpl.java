package com.ruleengine.ruleengine.rule.application.impl;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ruleengine.ruleengine.common.api.PaginatedResponse;
import com.ruleengine.ruleengine.common.error.ResourceNotFoundException;
import com.ruleengine.ruleengine.rule.api.dto.RuleResponse;
import com.ruleengine.ruleengine.rule.application.RuleQueryService;
import com.ruleengine.ruleengine.rule.infrastructure.mapper.RuleMapper;
import com.ruleengine.ruleengine.rule.infrastructure.persistence.RuleDefinitionEntity;
import com.ruleengine.ruleengine.rule.infrastructure.persistence.RuleDefinitionRepository;
import com.ruleengine.ruleengine.rule.infrastructure.persistence.RuleDefinitionSpecification;
import com.ruleengine.ruleengine.rule.infrastructure.persistence.RuleVersionRepository;

@Service
@Transactional(readOnly = true)
public class RuleQueryServiceImpl implements RuleQueryService {

    private static final Sort DEFAULT_SORT = Sort.by(
            Sort.Order.desc("priority"),
            Sort.Order.asc("createdAt"));

    private final RuleDefinitionRepository ruleRepository;
    private final RuleVersionRepository versionRepository;
    private final RuleMapper ruleMapper;

    public RuleQueryServiceImpl(RuleDefinitionRepository ruleRepository, RuleVersionRepository versionRepository, RuleMapper ruleMapper) {
        this.ruleRepository = ruleRepository;
        this.versionRepository = versionRepository;
        this.ruleMapper = ruleMapper;
    }

    @Override
    public RuleResponse getRule(UUID id) {
        return ruleRepository.findById(id)
                .map(ruleMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Rule", id));
    }

    @Override
    public PaginatedResponse<RuleResponse> getRules(String category, Boolean active, String search, Pageable pageable) {
        Specification<RuleDefinitionEntity> specification = Specification
                .where(RuleDefinitionSpecification.category(category))
                .and(RuleDefinitionSpecification.active(active))
                .and(RuleDefinitionSpecification.nameContains(search));

        Page<RuleResponse> page = ruleRepository.findAll(specification, ensureSorting(pageable))
                .map(ruleMapper::toResponse);
        return PaginatedResponse.from(page);
    }

    @Override
    public java.util.List<com.ruleengine.ruleengine.rule.api.dto.RuleVersionDto> getRuleVersions(java.util.UUID ruleId) {
        return versionRepository.findByRuleIdOrderByVersionNumberDesc(ruleId).stream()
                .map(v -> new com.ruleengine.ruleengine.rule.api.dto.RuleVersionDto(v.getId(), v.getRuleId(), v.getVersionNumber(), v.getCreatedAt()))
                .toList();
    }

    private Pageable ensureSorting(Pageable pageable) {
        if (pageable.getSort().isUnsorted()) {
            return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), DEFAULT_SORT);
        }
        return pageable;
    }
}
