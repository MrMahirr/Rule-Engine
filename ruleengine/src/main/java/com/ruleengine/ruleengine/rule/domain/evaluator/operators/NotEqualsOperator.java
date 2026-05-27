package com.ruleengine.ruleengine.rule.domain.evaluator.operators;

import org.springframework.stereotype.Component;

import com.ruleengine.ruleengine.rule.domain.RuleOperator;
import com.ruleengine.ruleengine.rule.domain.evaluator.OperatorStrategy;

@Component
public class NotEqualsOperator implements OperatorStrategy {

    private final EqualsOperator equalsOperator;

    public NotEqualsOperator(EqualsOperator equalsOperator) {
        this.equalsOperator = equalsOperator;
    }

    @Override
    public RuleOperator operator() {
        return RuleOperator.NOT_EQUALS;
    }

    @Override
    public boolean evaluate(Object actualValue, Object expectedValue) {
        return !equalsOperator.evaluate(actualValue, expectedValue);
    }
}
