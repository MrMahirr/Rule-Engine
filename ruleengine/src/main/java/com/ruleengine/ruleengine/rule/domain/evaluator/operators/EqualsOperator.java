package com.ruleengine.ruleengine.rule.domain.evaluator.operators;

import java.math.BigDecimal;
import java.util.Objects;

import org.springframework.stereotype.Component;

import com.ruleengine.ruleengine.rule.domain.RuleOperator;
import com.ruleengine.ruleengine.rule.domain.evaluator.OperatorStrategy;

@Component
public class EqualsOperator implements OperatorStrategy {

    @Override
    public RuleOperator operator() {
        return RuleOperator.EQUALS;
    }

    @Override
    public boolean evaluate(Object actualValue, Object expectedValue) {
        BigDecimal actualNumber = OperatorValueConverter.toBigDecimal(actualValue);
        BigDecimal expectedNumber = OperatorValueConverter.toBigDecimal(expectedValue);
        if (actualNumber != null && expectedNumber != null) {
            return actualNumber.compareTo(expectedNumber) == 0;
        }

        Boolean actualBoolean = OperatorValueConverter.toBoolean(actualValue);
        Boolean expectedBoolean = OperatorValueConverter.toBoolean(expectedValue);
        if (actualBoolean != null && expectedBoolean != null) {
            return actualBoolean.equals(expectedBoolean);
        }

        return Objects.equals(
                OperatorValueConverter.toText(actualValue),
                OperatorValueConverter.toText(expectedValue));
    }
}
