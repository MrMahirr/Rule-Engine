package com.ruleengine.ruleengine.rule.domain.evaluator;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.ruleengine.ruleengine.common.error.RuleValidationException;
import com.ruleengine.ruleengine.rule.domain.RuleOperator;

@Component
public class RuleEvaluator {

    private final Map<RuleOperator, OperatorStrategy> operators;

    public RuleEvaluator(List<OperatorStrategy> strategies) {
        this.operators = new EnumMap<>(RuleOperator.class);
        for (OperatorStrategy strategy : strategies) {
            operators.put(strategy.operator(), strategy);
        }
    }

    public EvaluationResult evaluate(Map<String, Object> ast, EvaluationContext context) {
        boolean matched = evaluateNode(ast, context, "$.ast");
        return matched ? EvaluationResult.match() : EvaluationResult.notMatched("Rule AST did not match facts");
    }

    @SuppressWarnings("unchecked")
    private boolean evaluateNode(Map<String, Object> node, EvaluationContext context, String path) {
        if (node == null || node.isEmpty()) {
            throw new RuleValidationException("AST node cannot be empty", Map.of("path", path));
        }

        String type = stringValue(node.get("type"));
        if ("CONDITION".equals(type)) {
            return evaluateCondition(node, context, path);
        }
        if ("AND".equals(type) || "OR".equals(type)) {
            Object childrenValue = node.get("children");
            if (!(childrenValue instanceof List<?> children) || children.isEmpty()) {
                throw new RuleValidationException("Logic node must include children", Map.of("path", path + ".children"));
            }

            if ("AND".equals(type)) {
                for (int i = 0; i < children.size(); i++) {
                    if (!evaluateChild(children.get(i), context, path + ".children[" + i + "]")) {
                        return false;
                    }
                }
                return true;
            }

            for (int i = 0; i < children.size(); i++) {
                if (evaluateChild(children.get(i), context, path + ".children[" + i + "]")) {
                    return true;
                }
            }
            return false;
        }

        throw new RuleValidationException("Unsupported AST node type", Map.of("path", path + ".type", "type", type));
    }

    @SuppressWarnings("unchecked")
    private boolean evaluateChild(Object child, EvaluationContext context, String path) {
        if (!(child instanceof Map<?, ?> childMap)) {
            throw new RuleValidationException("AST child must be an object", Map.of("path", path));
        }
        return evaluateNode((Map<String, Object>) childMap, context, path);
    }

    private boolean evaluateCondition(Map<String, Object> node, EvaluationContext context, String path) {
        String field = stringValue(node.get("field"));
        String operatorSymbol = stringValue(node.get("operator"));
        if (field == null || field.isBlank()) {
            throw new RuleValidationException("Condition field is required", Map.of("path", path + ".field"));
        }

        RuleOperator operator;
        try {
            operator = RuleOperator.fromSymbol(operatorSymbol);
        } catch (IllegalArgumentException exception) {
            throw new RuleValidationException("Unsupported rule operator",
                    Map.of("path", path + ".operator", "operator", operatorSymbol));
        }
        OperatorStrategy strategy = operators.get(operator);
        if (strategy == null) {
            throw new RuleValidationException("Rule operator is not registered",
                    Map.of("path", path + ".operator", "operator", operatorSymbol));
        }

        return strategy.evaluate(context.factValue(field), node.get("value"));
    }

    private String stringValue(Object value) {
        return value == null ? null : value.toString();
    }
}
