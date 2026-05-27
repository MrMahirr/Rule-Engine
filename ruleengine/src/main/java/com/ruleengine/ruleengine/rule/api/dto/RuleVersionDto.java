package com.ruleengine.ruleengine.rule.api.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record RuleVersionDto(
        UUID id,
        UUID ruleId,
        Integer versionNumber,
        LocalDateTime createdAt) {
}
