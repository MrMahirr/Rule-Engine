package com.ruleengine.ruleengine.rule.validation;

import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Component;

import com.ruleengine.ruleengine.common.error.RuleValidationException;
import com.ruleengine.ruleengine.rule.api.dto.ActionNodeDto;
import com.ruleengine.ruleengine.rule.api.dto.AstNodeDto;
import com.ruleengine.ruleengine.rule.api.dto.ConditionNodeDto;
import com.ruleengine.ruleengine.rule.api.dto.LogicNodeDto;
import com.ruleengine.ruleengine.rule.domain.RuleOperator;

@Component
public class RuleAstValidator {

    private static final Set<String> LOGIC_TYPES = Set.of("AND", "OR");

    public void validate(AstNodeDto ast) {
        validateNode(ast, "$.ast");
    }

    public void validateActions(Iterable<ActionNodeDto> actions) {
        if (actions == null) {
            throw new RuleValidationException("Rule must include at least one action");
        }
        int index = 0;
        for (ActionNodeDto action : actions) {
            if (action == null) {
                throw new RuleValidationException("Action cannot be null", Map.of("path", "$.actions[" + index + "]"));
            }
            if (!"ACTION".equals(action.type())) {
                throw new RuleValidationException("Action node type must be ACTION",
                        Map.of("path", "$.actions[" + index + "].type", "actual", action.type()));
            }
            if (action.actionType() == null) {
                throw new RuleValidationException("Action type is required",
                        Map.of("path", "$.actions[" + index + "].actionType"));
            }
            index++;
        }
        if (index == 0) {
            throw new RuleValidationException("Rule must include at least one action");
        }
    }

    private void validateNode(AstNodeDto node, String path) {
        if (node == null) {
            throw new RuleValidationException("AST node cannot be null", Map.of("path", path));
        }
        if (node instanceof ConditionNodeDto condition) {
            validateCondition(condition, path);
            return;
        }
        if (node instanceof LogicNodeDto logic) {
            validateLogic(logic, path);
            return;
        }
        throw new RuleValidationException("Unsupported AST node", Map.of("path", path, "type", node.type()));
    }

    private void validateCondition(ConditionNodeDto condition, String path) {
        if (!"CONDITION".equals(condition.type())) {
            throw new RuleValidationException("Condition node type must be CONDITION",
                    Map.of("path", path + ".type", "actual", condition.type()));
        }
        if (condition.field() == null || condition.field().isBlank()) {
            throw new RuleValidationException("Condition field is required", Map.of("path", path + ".field"));
        }
        try {
            RuleOperator.fromSymbol(condition.operator());
        } catch (IllegalArgumentException exception) {
            throw new RuleValidationException("Unsupported rule operator",
                    Map.of("path", path + ".operator", "operator", condition.operator()));
        }
        if (condition.value() == null) {
            throw new RuleValidationException("Condition value is required", Map.of("path", path + ".value"));
        }
    }

    private void validateLogic(LogicNodeDto logic, String path) {
        if (!LOGIC_TYPES.contains(logic.type())) {
            throw new RuleValidationException("Logic node type must be AND or OR",
                    Map.of("path", path + ".type", "actual", logic.type()));
        }
        if (logic.children() == null || logic.children().isEmpty()) {
            throw new RuleValidationException("Logic node must include children", Map.of("path", path + ".children"));
        }
        for (int i = 0; i < logic.children().size(); i++) {
            validateNode(logic.children().get(i), path + ".children[" + i + "]");
        }
    }
}
