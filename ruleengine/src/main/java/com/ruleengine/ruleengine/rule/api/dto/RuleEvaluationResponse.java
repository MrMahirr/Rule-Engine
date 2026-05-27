package com.ruleengine.ruleengine.rule.api.dto;

import java.util.List;

public record RuleEvaluationResponse(
        boolean matched,
        List<RuleMatchResult> matchedRules,
        int evaluatedRuleCount) {

    public RuleEvaluationResponse {
        matchedRules = matchedRules == null ? List.of() : List.copyOf(matchedRules);
    }
}
