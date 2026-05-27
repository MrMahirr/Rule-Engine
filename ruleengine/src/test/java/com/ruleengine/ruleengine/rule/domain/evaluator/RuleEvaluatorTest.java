package com.ruleengine.ruleengine.rule.domain.evaluator;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;

import com.ruleengine.ruleengine.rule.domain.evaluator.operators.ContainsOperator;
import com.ruleengine.ruleengine.rule.domain.evaluator.operators.EqualsOperator;
import com.ruleengine.ruleengine.rule.domain.evaluator.operators.GreaterOrEqualOperator;
import com.ruleengine.ruleengine.rule.domain.evaluator.operators.GreaterThanOperator;
import com.ruleengine.ruleengine.rule.domain.evaluator.operators.LessOrEqualOperator;
import com.ruleengine.ruleengine.rule.domain.evaluator.operators.LessThanOperator;
import com.ruleengine.ruleengine.rule.domain.evaluator.operators.NotContainsOperator;
import com.ruleengine.ruleengine.rule.domain.evaluator.operators.NotEqualsOperator;

import static org.assertj.core.api.Assertions.assertThat;

class RuleEvaluatorTest {

    private final ContainsOperator containsOperator = new ContainsOperator();
    private final RuleEvaluator evaluator = new RuleEvaluator(List.of(
            new EqualsOperator(),
            new NotEqualsOperator(new EqualsOperator()),
            new GreaterThanOperator(),
            new LessThanOperator(),
            new GreaterOrEqualOperator(),
            new LessOrEqualOperator(),
            containsOperator,
            new NotContainsOperator(containsOperator)));

    @Test
    void evaluatesNestedAndOrAst() {
        Map<String, Object> ast = Map.of(
                "type", "AND",
                "children", List.of(
                        Map.of("type", "CONDITION", "field", "orderAmount", "operator", ">", "value", "1000"),
                        Map.of(
                                "type", "OR",
                                "children", List.of(
                                        Map.of("type", "CONDITION", "field", "customerTier", "operator", "==", "value", "VIP"),
                                        Map.of("type", "CONDITION", "field", "tags", "operator", "contains", "value", "trusted")))));

        EvaluationResult result = evaluator.evaluate(ast, new EvaluationContext(Map.of(
                "orderAmount", "1250.50",
                "customerTier", "STANDARD",
                "tags", List.of("trusted", "repeat"))));

        assertThat(result.matched()).isTrue();
    }

    @Test
    void returnsNotMatchedWhenConditionFails() {
        Map<String, Object> ast = Map.of(
                "type", "AND",
                "children", List.of(
                        Map.of("type", "CONDITION", "field", "orderAmount", "operator", ">=", "value", "1000"),
                        Map.of("type", "CONDITION", "field", "blocked", "operator", "==", "value", false)));

        EvaluationResult result = evaluator.evaluate(ast, new EvaluationContext(Map.of(
                "orderAmount", 999,
                "blocked", false)));

        assertThat(result.matched()).isFalse();
    }
}
