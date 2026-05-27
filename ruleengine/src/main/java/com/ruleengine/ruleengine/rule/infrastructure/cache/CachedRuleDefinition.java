package com.ruleengine.ruleengine.rule.infrastructure.cache;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record CachedRuleDefinition(
        UUID id,
        String name,
        String category,
        int priority,
        Map<String, Object> ast,
        List<Map<String, Object>> actions,
        long version) {

    public CachedRuleDefinition {
        ast = ast == null ? Map.of() : Collections.unmodifiableMap(new LinkedHashMap<>(ast));
        actions = actions == null ? List.of() : copyActions(actions);
    }

    private static List<Map<String, Object>> copyActions(List<Map<String, Object>> actions) {
        List<Map<String, Object>> copied = new ArrayList<>();
        for (Map<String, Object> action : actions) {
            copied.add(action == null ? Map.of() : Collections.unmodifiableMap(new LinkedHashMap<>(action)));
        }
        return List.copyOf(copied);
    }
}
