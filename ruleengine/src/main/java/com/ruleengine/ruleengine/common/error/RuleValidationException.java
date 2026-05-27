package com.ruleengine.ruleengine.common.error;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

public class RuleValidationException extends RuntimeException {

    private final Map<String, Object> details;

    public RuleValidationException(String message) {
        this(message, Map.of());
    }

    public RuleValidationException(String message, Map<String, Object> details) {
        super(message);
        this.details = details == null ? Map.of() : Collections.unmodifiableMap(new LinkedHashMap<>(details));
    }

    public Map<String, Object> getDetails() {
        return details;
    }
}
