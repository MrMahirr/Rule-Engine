package com.ruleengine.ruleengine.rule.api.dto;

import java.util.List;
import java.util.UUID;

public record RuleMatchResult(
        UUID ruleId,
        String ruleName,
        List<ActionNodeDto> actions) {

    public RuleMatchResult {
        actions = actions == null ? List.of() : List.copyOf(actions);
    }
}
