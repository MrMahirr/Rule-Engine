package com.ruleengine.ruleengine.rule.application.impl;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ruleengine.ruleengine.rule.application.RuleCacheService;
import com.ruleengine.ruleengine.rule.infrastructure.cache.CachedRuleDefinition;
import com.ruleengine.ruleengine.rule.infrastructure.cache.RuleCacheKeys;
import com.ruleengine.ruleengine.rule.infrastructure.persistence.RuleDefinitionEntity;
import com.ruleengine.ruleengine.rule.infrastructure.persistence.RuleDefinitionRepository;

@Service
@Transactional(readOnly = true)
public class RuleCacheServiceImpl implements RuleCacheService {

    private final RuleDefinitionRepository ruleRepository;

    public RuleCacheServiceImpl(RuleDefinitionRepository ruleRepository) {
        this.ruleRepository = ruleRepository;
    }

    @Override
    @Cacheable(cacheNames = RuleCacheKeys.ACTIVE_RULES, key = "'all'")
    public List<CachedRuleDefinition> getActiveRules() {
        return ruleRepository.findByActiveTrueOrderByPriorityDescCreatedAtAsc().stream()
                .map(this::toCachedRule)
                .toList();
    }

    @Override
    @Cacheable(cacheNames = RuleCacheKeys.RULE_BY_ID, key = "#id")
    public Optional<CachedRuleDefinition> getRuleById(UUID id) {
        return ruleRepository.findByIdAndActiveTrue(id)
                .map(this::toCachedRule);
    }

    private CachedRuleDefinition toCachedRule(RuleDefinitionEntity entity) {
        return new CachedRuleDefinition(
                entity.getId(),
                entity.getName(),
                entity.getCategory(),
                entity.getPriority(),
                entity.getAst(),
                entity.getActions(),
                entity.getVersion());
    }
}
