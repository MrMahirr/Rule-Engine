package com.ruleengine.ruleengine.rule.api.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record RuleCreateRequest(
        @NotBlank String name,
        String description,
        String category,
        @Min(0) int priority,
        @NotNull Boolean isActive,
        @NotNull @Valid AstNodeDto ast,
        @NotEmpty List<@Valid ActionNodeDto> actions) {

    public RuleCreateRequest {
        actions = actions == null ? List.of() : List.copyOf(actions);
    }
}
