package com.ruleengine.ruleengine.rule.infrastructure.persistence;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

public final class JsonbConverter {

    private static final ObjectMapper OBJECT_MAPPER = JsonMapper.builder()
            .findAndAddModules()
            .build();

    private JsonbConverter() {
    }

    public static String toJson(Object value) {
        try {
            return OBJECT_MAPPER.writeValueAsString(value);
        } catch (JacksonException exception) {
            throw new IllegalArgumentException("Could not serialize JSONB value", exception);
        }
    }

    public static <T> T fromJson(String json, Class<T> targetType) {
        try {
            return OBJECT_MAPPER.readValue(json, targetType);
        } catch (JacksonException exception) {
            throw new IllegalArgumentException("Could not deserialize JSONB value", exception);
        }
    }
}
