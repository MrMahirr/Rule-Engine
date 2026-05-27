package com.ruleengine.ruleengine.rule.domain.ast;

import com.ruleengine.ruleengine.rule.domain.RuleOperator;

public record ConditionNode(
        String field,
        RuleOperator operator,
        Object value) implements AstNode {

    @Override
    public String type() {
        return "CONDITION";
    }
}
