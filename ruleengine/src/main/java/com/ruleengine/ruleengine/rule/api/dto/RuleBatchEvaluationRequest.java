package com.ruleengine.ruleengine.rule.api.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record RuleBatchEvaluationRequest(
        UUID ruleId,
        @NotEmpty List<Map<String, Object>> factsList) {
}
