package com.ruleengine.ruleengine.rule.api.dto;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

import com.ruleengine.ruleengine.rule.domain.ActionType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ActionNodeDto(
        @NotBlank String type,
        @NotNull ActionType actionType,
        Map<String, Object> params) {

    public ActionNodeDto {
        params = params == null ? Map.of() : Collections.unmodifiableMap(new LinkedHashMap<>(params));
    }
}
