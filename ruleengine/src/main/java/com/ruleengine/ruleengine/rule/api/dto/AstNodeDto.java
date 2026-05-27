package com.ruleengine.ruleengine.rule.api.dto;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.EXISTING_PROPERTY, property = "type", visible = true)
@JsonSubTypes({
        @JsonSubTypes.Type(value = ConditionNodeDto.class, name = "CONDITION"),
        @JsonSubTypes.Type(value = LogicNodeDto.class, name = "AND"),
        @JsonSubTypes.Type(value = LogicNodeDto.class, name = "OR")
})
public interface AstNodeDto {

    String type();
}
