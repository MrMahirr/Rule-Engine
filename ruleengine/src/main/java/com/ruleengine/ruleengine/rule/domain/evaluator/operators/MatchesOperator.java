package com.ruleengine.ruleengine.rule.domain.evaluator.operators;

import java.util.regex.Pattern;
import java.util.regex.PatternSyntaxException;

import org.springframework.stereotype.Component;

import com.ruleengine.ruleengine.rule.domain.RuleOperator;
import com.ruleengine.ruleengine.rule.domain.evaluator.OperatorStrategy;

@Component
public class MatchesOperator implements OperatorStrategy {

    @Override
    public RuleOperator operator() {
        return RuleOperator.MATCHES;
    }

    @Override
    public boolean evaluate(Object actualValue, Object expectedValue) {
        if (actualValue == null || expectedValue == null) {
            return false;
        }

        try {
            Pattern pattern = Pattern.compile(expectedValue.toString());
            return pattern.matcher(actualValue.toString()).matches();
        } catch (PatternSyntaxException e) {
            return false;
        }
    }
}
