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

    static java.time.Instant toDate(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof java.time.Instant instant) {
            return instant;
        }
        if (value instanceof java.util.Date date) {
            return date.toInstant();
        }
        String text = value.toString().trim();
        try {
            return java.time.Instant.parse(text);
        } catch (java.time.format.DateTimeParseException e1) {
            try {
                return java.time.LocalDate.parse(text).atStartOfDay(java.time.ZoneId.of("UTC")).toInstant();
            } catch (java.time.format.DateTimeParseException e2) {
                try {
                    return java.time.LocalDateTime.parse(text).atZone(java.time.ZoneId.of("UTC")).toInstant();
                } catch (java.time.format.DateTimeParseException e3) {
                    return null;
                }
            }
        }
    }
}
