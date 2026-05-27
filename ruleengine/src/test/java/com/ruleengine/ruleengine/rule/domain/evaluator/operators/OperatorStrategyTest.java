package com.ruleengine.ruleengine.rule.domain.evaluator.operators;

import java.util.List;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class OperatorStrategyTest {

    @Test
    void equalsSupportsNumbersBooleansAndStrings() {
        EqualsOperator operator = new EqualsOperator();

        assertThat(operator.evaluate("10.0", 10)).isTrue();
        assertThat(operator.evaluate("true", true)).isTrue();
        assertThat(operator.evaluate("ORDER", "ORDER")).isTrue();
        assertThat(operator.evaluate("ORDER", "USER")).isFalse();
    }

    @Test
    void numericComparisonsUseBigDecimal() {
        assertThat(new GreaterThanOperator().evaluate("10.50", "10.49")).isTrue();
        assertThat(new LessOrEqualOperator().evaluate(10, "10.00")).isTrue();
        assertThat(new LessThanOperator().evaluate("abc", 10)).isFalse();
    }

    @Test
    void containsSupportsTextAndCollections() {
        ContainsOperator contains = new ContainsOperator();
        NotContainsOperator notContains = new NotContainsOperator(contains);

        assertThat(contains.evaluate("trusted customer", "trusted")).isTrue();
        assertThat(contains.evaluate(List.of("trusted", "vip"), "vip")).isTrue();
        assertThat(notContains.evaluate(List.of("trusted", "vip"), "blocked")).isTrue();
    }
}
