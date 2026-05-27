package com.ruleengine.ruleengine.rule.api.dto;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public record RuleEvaluationRequest(
        UUID ruleId,
        @NotNull Map<String, Object> facts) {

    public RuleEvaluationRequest {
        facts = facts == null ? Map.of() : Collections.unmodifiableMap(new LinkedHashMap<>(facts));
    }
}
