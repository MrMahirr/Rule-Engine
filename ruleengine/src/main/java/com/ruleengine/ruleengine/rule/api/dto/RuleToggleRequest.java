package com.ruleengine.ruleengine.rule.api.dto;

import jakarta.validation.constraints.NotNull;

public record RuleToggleRequest(
        @NotNull Boolean isActive) {
}
