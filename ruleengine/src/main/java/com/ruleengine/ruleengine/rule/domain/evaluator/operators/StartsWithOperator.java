package com.ruleengine.ruleengine.rule.domain.evaluator.operators;

import org.springframework.stereotype.Component;

import com.ruleengine.ruleengine.rule.domain.RuleOperator;
import com.ruleengine.ruleengine.rule.domain.evaluator.OperatorStrategy;

@Component
public class StartsWithOperator implements OperatorStrategy {

    @Override
    public RuleOperator operator() {
        return RuleOperator.STARTS_WITH;
    }

    @Override
    public boolean evaluate(Object actualValue, Object expectedValue) {
        if (actualValue == null || expectedValue == null) {
            return false;
        }

        return actualValue.toString().startsWith(expectedValue.toString());
    }
}
