package com.ruleengine.ruleengine.rule.domain.evaluator.operators;

import java.math.BigDecimal;

import com.ruleengine.ruleengine.rule.domain.evaluator.OperatorStrategy;

abstract class NumericComparisonOperator implements OperatorStrategy {

    @Override
    public boolean evaluate(Object actualValue, Object expectedValue) {
        BigDecimal actualNumber = OperatorValueConverter.toBigDecimal(actualValue);
        BigDecimal expectedNumber = OperatorValueConverter.toBigDecimal(expectedValue);
        if (actualNumber == null || expectedNumber == null) {
            return false;
        }
        return compare(actualNumber.compareTo(expectedNumber));
    }

    protected abstract boolean compare(int comparison);
}
