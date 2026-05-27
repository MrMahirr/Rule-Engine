package com.ruleengine.ruleengine.common.error;

import java.util.Map;

public class ResourceNotFoundException extends RuntimeException {

    private final Map<String, Object> details;

    public ResourceNotFoundException(String resourceName, Object id) {
        super(resourceName + " not found");
        this.details = Map.of("resource", resourceName, "id", id);
    }

    public Map<String, Object> getDetails() {
        return details;
    }
}
