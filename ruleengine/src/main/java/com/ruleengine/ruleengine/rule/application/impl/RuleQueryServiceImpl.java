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

@Service
@Transactional(readOnly = true)
public class RuleQueryServiceImpl implements RuleQueryService {

    private static final Sort DEFAULT_SORT = Sort.by(
            Sort.Order.desc("priority"),
            Sort.Order.asc("createdAt"));

    private final RuleDefinitionRepository ruleRepository;
    private final RuleMapper ruleMapper;

    public RuleQueryServiceImpl(RuleDefinitionRepository ruleRepository, RuleMapper ruleMapper) {
        this.ruleRepository = ruleRepository;
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

        Page<RuleResponse> page = ruleRepository.findAll(specification, withDefaultSort(pageable))
                .map(ruleMapper::toResponse);
        return PaginatedResponse.from(page);
    }

    private Pageable withDefaultSort(Pageable pageable) {
        if (pageable == null) {
            return PageRequest.of(0, 20, DEFAULT_SORT);
        }
        if (pageable.getSort().isUnsorted()) {
            return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), DEFAULT_SORT);
        }
        return pageable;
    }
}
