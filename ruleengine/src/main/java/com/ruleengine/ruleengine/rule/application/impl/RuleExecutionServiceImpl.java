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
    private final RuleExecutionLogger executionLogger;

    public RuleExecutionServiceImpl(
            RuleCacheService ruleCacheService,
            RuleEvaluator ruleEvaluator,
            RuleMapper ruleMapper,
            RuleExecutionLogger executionLogger) {
        this.ruleCacheService = ruleCacheService;
        this.ruleEvaluator = ruleEvaluator;
        this.ruleMapper = ruleMapper;
        this.executionLogger = executionLogger;
    }

    @Override
    public RuleEvaluationResponse evaluate(RuleEvaluationRequest request) {
        long startTime = System.currentTimeMillis();
        
        EvaluationContext context = new EvaluationContext(request.facts());
        List<CachedRuleDefinition> rules = rulesFor(request);

        List<RuleMatchResult> matches = rules.stream()
                .filter(rule -> ruleEvaluator.evaluate(rule.ast(), context).matched())
                .map(this::toMatchResult)
                .toList();

        RuleEvaluationResponse response = new RuleEvaluationResponse(!matches.isEmpty(), matches, rules.size());
        
        long executionTimeMs = System.currentTimeMillis() - startTime;
        executionLogger.logExecution(request, response, executionTimeMs);
        
        return response;
    }

    private List<CachedRuleDefinition> rulesFor(RuleEvaluationRequest request) {
        if (request.ruleId() == null) {
            return ruleCacheService.getActiveRules();
        }
        CachedRuleDefinition rule = ruleCacheService.getRuleById(request.ruleId())
                .orElseThrow(() -> new ResourceNotFoundException("Active rule", request.ruleId()));
        return List.of(rule);
    }

    @Override
    public com.ruleengine.ruleengine.rule.api.dto.RuleBatchEvaluationResponse evaluateBatch(com.ruleengine.ruleengine.rule.api.dto.RuleBatchEvaluationRequest request) {
        CachedRuleDefinition rule = ruleCacheService.getRuleById(request.ruleId())
                .orElseThrow(() -> new ResourceNotFoundException("Active rule", request.ruleId()));

        java.util.List<com.ruleengine.ruleengine.rule.api.dto.RuleBatchEvaluationResponse.BatchResultDto> results = new java.util.ArrayList<>();
        long matchedRecords = 0;
        
        for (java.util.Map<String, Object> fact : request.factsList()) {
            EvaluationContext context = new EvaluationContext(fact);
            boolean matched = ruleEvaluator.evaluate(rule.ast(), context).matched();
            List<RuleMatchResult> matches = matched ? List.of(toMatchResult(rule)) : List.of();
            
            if (matched) {
                matchedRecords++;
            }
            
            results.add(new com.ruleengine.ruleengine.rule.api.dto.RuleBatchEvaluationResponse.BatchResultDto(fact, matched, matches));
        }
        
        long failedRecords = request.factsList().size() - matchedRecords;
        return new com.ruleengine.ruleengine.rule.api.dto.RuleBatchEvaluationResponse(
                request.factsList().size(), matchedRecords, failedRecords, results);
    }

    private RuleMatchResult toMatchResult(CachedRuleDefinition rule) {
        return new RuleMatchResult(
                rule.id(),
                rule.name(),
                ruleMapper.toActionDtos(rule.actions()));
    }
}
