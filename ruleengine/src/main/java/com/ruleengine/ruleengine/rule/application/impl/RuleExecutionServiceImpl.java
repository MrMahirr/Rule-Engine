package com.ruleengine.ruleengine.rule.application.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ruleengine.ruleengine.common.error.ResourceNotFoundException;
import com.ruleengine.ruleengine.rule.api.dto.RuleEvaluationRequest;
import com.ruleengine.ruleengine.rule.api.dto.RuleEvaluationResponse;
import com.ruleengine.ruleengine.rule.api.dto.RuleMatchResult;
import com.ruleengine.ruleengine.rule.application.RuleCacheService;
import com.ruleengine.ruleengine.rule.application.RuleExecutionService;
import com.ruleengine.ruleengine.rule.domain.evaluator.EvaluationContext;
import com.ruleengine.ruleengine.rule.domain.evaluator.RuleEvaluator;
import com.ruleengine.ruleengine.rule.infrastructure.cache.CachedRuleDefinition;
import com.ruleengine.ruleengine.rule.infrastructure.mapper.RuleMapper;

@Service
public class RuleExecutionServiceImpl implements RuleExecutionService {

    private final RuleCacheService ruleCacheService;
    private final RuleEvaluator ruleEvaluator;
    private final RuleMapper ruleMapper;

    public RuleExecutionServiceImpl(
            RuleCacheService ruleCacheService,
            RuleEvaluator ruleEvaluator,
            RuleMapper ruleMapper) {
        this.ruleCacheService = ruleCacheService;
        this.ruleEvaluator = ruleEvaluator;
        this.ruleMapper = ruleMapper;
    }

    @Override
    public RuleEvaluationResponse evaluate(RuleEvaluationRequest request) {
        EvaluationContext context = new EvaluationContext(request.facts());
        List<CachedRuleDefinition> rules = rulesFor(request);

        List<RuleMatchResult> matches = rules.stream()
                .filter(rule -> ruleEvaluator.evaluate(rule.ast(), context).matched())
                .map(this::toMatchResult)
                .toList();

        return new RuleEvaluationResponse(!matches.isEmpty(), matches, rules.size());
    }

    private List<CachedRuleDefinition> rulesFor(RuleEvaluationRequest request) {
        if (request.ruleId() == null) {
            return ruleCacheService.getActiveRules();
        }
        CachedRuleDefinition rule = ruleCacheService.getRuleById(request.ruleId())
                .orElseThrow(() -> new ResourceNotFoundException("Active rule", request.ruleId()));
        return List.of(rule);
    }

    private RuleMatchResult toMatchResult(CachedRuleDefinition rule) {
        return new RuleMatchResult(
                rule.id(),
                rule.name(),
                ruleMapper.toActionDtos(rule.actions()));
    }
}
