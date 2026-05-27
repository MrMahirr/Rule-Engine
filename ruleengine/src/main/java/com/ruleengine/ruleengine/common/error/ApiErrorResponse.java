package com.ruleengine.ruleengine.common.error;

import java.time.Instant;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

public record ApiErrorResponse(
        String message,
        int statusCode,
        Map<String, Object> details,
        Instant timestamp) {

    public ApiErrorResponse {
        details = details == null ? Map.of() : Collections.unmodifiableMap(new LinkedHashMap<>(details));
        timestamp = timestamp == null ? Instant.now() : timestamp;
    }

    public static ApiErrorResponse of(String message, int statusCode, Map<String, Object> details) {
        return new ApiErrorResponse(message, statusCode, details, Instant.now());
    }
}
