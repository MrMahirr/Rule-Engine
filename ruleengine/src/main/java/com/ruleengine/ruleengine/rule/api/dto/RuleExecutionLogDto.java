package com.ruleengine.ruleengine.rule.api.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record RuleExecutionLogDto(
        UUID id,
        UUID ruleId,
        String ruleName,
        long executionTimeMs,
        String factPayload,
        String result,
        boolean matched,
        LocalDateTime createdAt) {
}
