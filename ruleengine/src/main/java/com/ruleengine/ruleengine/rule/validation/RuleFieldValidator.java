package com.ruleengine.ruleengine.rule.validation;

import java.util.Collection;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Component;

import com.ruleengine.ruleengine.common.error.RuleValidationException;
import com.ruleengine.ruleengine.field.api.dto.FieldCreateRequest;
import com.ruleengine.ruleengine.field.domain.FieldType;
import com.ruleengine.ruleengine.rule.api.dto.AstNodeDto;
import com.ruleengine.ruleengine.rule.api.dto.ConditionNodeDto;
import com.ruleengine.ruleengine.rule.api.dto.LogicNodeDto;

@Component
public class RuleFieldValidator {

    public void validateFieldDefinition(FieldCreateRequest request) {
        if (request.type() == FieldType.ENUM && request.allowedValues().isEmpty()) {
            throw new RuleValidationException("ENUM field must define allowed values",
                    Map.of("field", request.name(), "path", "$.allowedValues"));
        }
        if (request.type() != FieldType.ENUM && !request.allowedValues().isEmpty()) {
            throw new RuleValidationException("Allowed values can only be used with ENUM fields",
                    Map.of("field", request.name(), "type", request.type()));
        }
    }

    public void validateAstFields(AstNodeDto ast, Collection<String> knownFieldNames) {
        Set<String> knownFields = knownFieldNames == null ? Set.of() : new HashSet<>(knownFieldNames);
        validateNodeFields(ast, knownFields, "$.ast");
    }

    private void validateNodeFields(AstNodeDto node, Set<String> knownFieldNames, String path) {
        if (node instanceof ConditionNodeDto condition) {
            if (!knownFieldNames.contains(condition.field())) {
                throw new RuleValidationException("Rule references an unknown field",
                        Map.of("path", path + ".field", "field", condition.field()));
            }
            return;
        }
        if (node instanceof LogicNodeDto logic) {
            for (int i = 0; i < logic.children().size(); i++) {
                validateNodeFields(logic.children().get(i), knownFieldNames, path + ".children[" + i + "]");
            }
        }
    }
}
