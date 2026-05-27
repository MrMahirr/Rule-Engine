package com.ruleengine.ruleengine.rule.domain;

import java.util.Arrays;

public enum RuleOperator {
    EQUALS("=="),
    NOT_EQUALS("!="),
    GREATER_THAN(">"),
    LESS_THAN("<"),
    GREATER_OR_EQUAL(">="),
    LESS_OR_EQUAL("<="),
    CONTAINS("contains"),
    NOT_CONTAINS("not_contains"),
    IN("in"),
    NOT_IN("not_in"),
    STARTS_WITH("starts_with"),
    ENDS_WITH("ends_with"),
    MATCHES("matches");

    private final String symbol;

    RuleOperator(String symbol) {
        this.symbol = symbol;
    }

    public String symbol() {
        return symbol;
    }

    public static RuleOperator fromSymbol(String symbol) {
        return Arrays.stream(values())
                .filter(operator -> operator.symbol.equals(symbol))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unsupported rule operator: " + symbol));
    }
}
