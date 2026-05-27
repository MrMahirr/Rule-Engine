package com.ruleengine.ruleengine.rule.domain.evaluator.operators;

import org.springframework.stereotype.Component;

import com.ruleengine.ruleengine.rule.domain.RuleOperator;
import com.ruleengine.ruleengine.rule.domain.evaluator.OperatorStrategy;

@Component
public class NotContainsOperator implements OperatorStrategy {

    private final ContainsOperator containsOperator;

    public NotContainsOperator(ContainsOperator containsOperator) {
        this.containsOperator = containsOperator;
    }

    @Override
    public RuleOperator operator() {
        return RuleOperator.NOT_CONTAINS;
    }

    @Override
    public boolean evaluate(Object actualValue, Object expectedValue) {
        return !containsOperator.evaluate(actualValue, expectedValue);
    }
}
