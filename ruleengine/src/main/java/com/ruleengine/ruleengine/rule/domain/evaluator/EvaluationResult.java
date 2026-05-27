package com.ruleengine.ruleengine.rule.domain.evaluator;

public record EvaluationResult(
        boolean matched,
        String reason) {

    public static EvaluationResult match() {
        return new EvaluationResult(true, null);
    }

    public static EvaluationResult notMatched(String reason) {
        return new EvaluationResult(false, reason);
    }
}
