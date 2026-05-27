package com.ruleengine.ruleengine.rule.domain.evaluator;

import com.ruleengine.ruleengine.rule.domain.RuleOperator;

public interface OperatorStrategy {

    RuleOperator operator();

    boolean evaluate(Object actualValue, Object expectedValue);
}
