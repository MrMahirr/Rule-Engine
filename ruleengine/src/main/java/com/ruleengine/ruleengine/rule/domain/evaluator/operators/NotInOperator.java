package com.ruleengine.ruleengine.rule.domain.evaluator.operators;

import org.springframework.stereotype.Component;

import com.ruleengine.ruleengine.rule.domain.RuleOperator;
import com.ruleengine.ruleengine.rule.domain.evaluator.OperatorStrategy;

@Component
public class NotInOperator implements OperatorStrategy {

    private final InOperator inOperator;

    public NotInOperator(InOperator inOperator) {
        this.inOperator = inOperator;
    }

    @Override
    public RuleOperator operator() {
        return RuleOperator.NOT_IN;
    }

    @Override
    public boolean evaluate(Object actualValue, Object expectedValue) {
        if (actualValue == null || expectedValue == null) {
            return false;
        }
        return !inOperator.evaluate(actualValue, expectedValue);
    }
}
