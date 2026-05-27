package com.ruleengine.ruleengine.rule.domain.evaluator.operators;

import java.math.BigDecimal;

final class OperatorValueConverter {

    private OperatorValueConverter() {
    }

    static BigDecimal toBigDecimal(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof BigDecimal decimal) {
            return decimal;
        }
        if (value instanceof Number number) {
            return new BigDecimal(number.toString());
        }
        try {
            return new BigDecimal(value.toString().trim());
        } catch (NumberFormatException exception) {
            return null;
        }
    }

    static Boolean toBoolean(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Boolean bool) {
            return bool;
        }
        String text = value.toString().trim();
        if ("true".equalsIgnoreCase(text)) {
            return Boolean.TRUE;
        }
        if ("false".equalsIgnoreCase(text)) {
            return Boolean.FALSE;
        }
        return null;
    }

    static String toText(Object value) {
        return value == null ? null : value.toString();
    }
}
