package com.ruleengine.ruleengine.rule.domain.evaluator;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

public record EvaluationContext(Map<String, Object> facts) {

    public EvaluationContext {
        facts = facts == null ? Map.of() : Collections.unmodifiableMap(new LinkedHashMap<>(facts));
    }

    public Object factValue(String field) {
        return facts.get(field);
    }
}
