package com.ruleengine.ruleengine.rule.application.impl;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;

import com.ruleengine.ruleengine.rule.api.dto.RuleEvaluationRequest;
import com.ruleengine.ruleengine.rule.api.dto.RuleEvaluationResponse;
import com.ruleengine.ruleengine.rule.application.RuleCacheService;
import com.ruleengine.ruleengine.rule.domain.evaluator.RuleEvaluator;
import com.ruleengine.ruleengine.rule.domain.evaluator.operators.ContainsOperator;
import com.ruleengine.ruleengine.rule.domain.evaluator.operators.EqualsOperator;
import com.ruleengine.ruleengine.rule.domain.evaluator.operators.GreaterOrEqualOperator;
import com.ruleengine.ruleengine.rule.domain.evaluator.operators.GreaterThanOperator;
import com.ruleengine.ruleengine.rule.domain.evaluator.operators.LessOrEqualOperator;
import com.ruleengine.ruleengine.rule.domain.evaluator.operators.LessThanOperator;
import com.ruleengine.ruleengine.rule.domain.evaluator.operators.NotContainsOperator;
import com.ruleengine.ruleengine.rule.domain.evaluator.operators.NotEqualsOperator;
import com.ruleengine.ruleengine.rule.infrastructure.cache.CachedRuleDefinition;
import com.ruleengine.ruleengine.rule.infrastructure.mapper.RuleMapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class RuleExecutionServiceImplTest {

    private final RuleCacheService cacheService = mock(RuleCacheService.class);
    private final ContainsOperator containsOperator = new ContainsOperator();
    private final RuleExecutionServiceImpl service = new RuleExecutionServiceImpl(
            cacheService,
            new RuleEvaluator(List.of(
                    new EqualsOperator(),
                    new NotEqualsOperator(new EqualsOperator()),
                    new GreaterThanOperator(),
                    new LessThanOperator(),
                    new GreaterOrEqualOperator(),
                    new LessOrEqualOperator(),
                    containsOperator,
                    new NotContainsOperator(containsOperator))),
            new RuleMapper());

    @Test
    void evaluatesAllActiveRulesWhenRuleIdIsNotProvided() {
        CachedRuleDefinition matchingRule = rule("High value", ">", "1000");
        CachedRuleDefinition nonMatchingRule = rule("Very high value", ">", "5000");
        when(cacheService.getActiveRules()).thenReturn(List.of(matchingRule, nonMatchingRule));

        RuleEvaluationResponse response = service.evaluate(new RuleEvaluationRequest(
                null,
                Map.of("orderAmount", "1500")));

        assertThat(response.matched()).isTrue();
        assertThat(response.evaluatedRuleCount()).isEqualTo(2);
        assertThat(response.matchedRules()).hasSize(1);
        assertThat(response.matchedRules().get(0).ruleName()).isEqualTo("High value");
        verify(cacheService).getActiveRules();
    }

    @Test
    void evaluatesSingleActiveRuleWhenRuleIdIsProvided() {
        UUID id = UUID.randomUUID();
        when(cacheService.getRuleById(id)).thenReturn(Optional.of(rule(id, "Single rule", ">=", "1000")));

        RuleEvaluationResponse response = service.evaluate(new RuleEvaluationRequest(
                id,
                Map.of("orderAmount", 1000)));

        assertThat(response.matched()).isTrue();
        assertThat(response.evaluatedRuleCount()).isEqualTo(1);
        verify(cacheService).getRuleById(id);
    }

    private CachedRuleDefinition rule(String name, String operator, String value) {
        return rule(UUID.randomUUID(), name, operator, value);
    }

    private CachedRuleDefinition rule(UUID id, String name, String operator, String value) {
        return new CachedRuleDefinition(
                id,
                name,
                "ORDER",
                10,
                Map.of(
                        "type", "CONDITION",
                        "field", "orderAmount",
                        "operator", operator,
                        "value", value),
                List.of(Map.of(
                        "type", "ACTION",
                        "actionType", "ALLOW",
                        "params", Map.of())),
                0);
    }
}
