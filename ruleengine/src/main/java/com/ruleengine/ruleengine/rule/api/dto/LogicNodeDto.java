package com.ruleengine.ruleengine.rule.api.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

public record LogicNodeDto(
        @NotBlank String type,
        @NotEmpty List<@Valid AstNodeDto> children) implements AstNodeDto {

    public LogicNodeDto {
        children = children == null ? List.of() : List.copyOf(children);
    }
}
