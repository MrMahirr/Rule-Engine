package com.ruleengine.ruleengine.rule.application;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.ruleengine.ruleengine.rule.infrastructure.cache.CachedRuleDefinition;

public interface RuleCacheService {

    List<CachedRuleDefinition> getActiveRules();

    Optional<CachedRuleDefinition> getRuleById(UUID id);
}
