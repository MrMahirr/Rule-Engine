package com.ruleengine.ruleengine.rule.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ConditionNodeDto(
        @NotBlank String type,
        @NotBlank String field,
        @NotBlank String operator,
        @NotNull Object value) implements AstNodeDto {
}
