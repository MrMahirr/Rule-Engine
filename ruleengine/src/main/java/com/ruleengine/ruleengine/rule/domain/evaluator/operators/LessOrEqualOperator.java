package com.ruleengine.ruleengine.rule.domain.evaluator.operators;

import org.springframework.stereotype.Component;

import com.ruleengine.ruleengine.rule.domain.RuleOperator;

@Component
public class LessOrEqualOperator extends NumericComparisonOperator {

    @Override
    public RuleOperator operator() {
        return RuleOperator.LESS_OR_EQUAL;
    }

    @Override
    protected boolean compare(int comparison) {
        return comparison <= 0;
    }
}
