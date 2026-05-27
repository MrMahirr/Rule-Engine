package com.ruleengine.ruleengine.rule.domain.action;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

import com.ruleengine.ruleengine.rule.domain.ActionType;

public record RuleAction(
        ActionType actionType,
        Map<String, Object> params) {

    public RuleAction {
        params = params == null ? Map.of() : Collections.unmodifiableMap(new LinkedHashMap<>(params));
    }
}
