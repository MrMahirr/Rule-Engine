package com.ruleengine.ruleengine.rule.domain.evaluator.operators;

import java.util.Collection;
import java.util.Objects;

import org.springframework.stereotype.Component;

import com.ruleengine.ruleengine.rule.domain.RuleOperator;
import com.ruleengine.ruleengine.rule.domain.evaluator.OperatorStrategy;

@Component
public class ContainsOperator implements OperatorStrategy {

    @Override
    public RuleOperator operator() {
        return RuleOperator.CONTAINS;
    }

    @Override
    public boolean evaluate(Object actualValue, Object expectedValue) {
        if (actualValue == null || expectedValue == null) {
            return false;
        }
        if (actualValue instanceof Collection<?> collection) {
            return collection.stream().anyMatch(item -> valuesEqual(item, expectedValue));
        }
        return OperatorValueConverter.toText(actualValue)
                .contains(OperatorValueConverter.toText(expectedValue));
    }

    private boolean valuesEqual(Object actualValue, Object expectedValue) {
        return Objects.equals(
                OperatorValueConverter.toText(actualValue),
                OperatorValueConverter.toText(expectedValue));
    }
}
