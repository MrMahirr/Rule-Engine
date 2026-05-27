package com.ruleengine.ruleengine.rule.domain.evaluator.operators;

import java.util.Arrays;
import java.util.List;

import org.springframework.stereotype.Component;

import com.ruleengine.ruleengine.rule.domain.RuleOperator;
import com.ruleengine.ruleengine.rule.domain.evaluator.OperatorStrategy;

@Component
public class InOperator implements OperatorStrategy {

    @Override
    public RuleOperator operator() {
        return RuleOperator.IN;
    }

    @Override
    public boolean evaluate(Object actualValue, Object expectedValue) {
        if (actualValue == null || expectedValue == null) {
            return false;
        }

        String actualStr = actualValue.toString();
        
        if (expectedValue instanceof List<?> list) {
            return list.stream()
                    .map(Object::toString)
                    .anyMatch(actualStr::equals);
        }

        String expectedStr = expectedValue.toString();
        return Arrays.stream(expectedStr.split(","))
                .map(String::trim)
                .anyMatch(actualStr::equals);
    }
}
