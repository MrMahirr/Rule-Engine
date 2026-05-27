package com.ruleengine.ruleengine.rule.api.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record RuleResponse(
        UUID id,
        String name,
        String description,
        String category,
        int priority,
        boolean isActive,
        AstNodeDto ast,
        List<ActionNodeDto> actions,
        long version,
        Instant createdAt,
        Instant updatedAt,
        boolean hasConflicts,
        List<String> conflictDetails) {

    public RuleResponse {
        actions = actions == null ? List.of() : List.copyOf(actions);
        conflictDetails = conflictDetails == null ? List.of() : List.copyOf(conflictDetails);
    }
}
