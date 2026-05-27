package com.ruleengine.ruleengine.rule.infrastructure.mapper;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.ruleengine.ruleengine.rule.api.dto.ActionNodeDto;
import com.ruleengine.ruleengine.rule.api.dto.AstNodeDto;
import com.ruleengine.ruleengine.rule.api.dto.ConditionNodeDto;
import com.ruleengine.ruleengine.rule.api.dto.LogicNodeDto;
import com.ruleengine.ruleengine.rule.api.dto.RuleCreateRequest;
import com.ruleengine.ruleengine.rule.api.dto.RuleResponse;
import com.ruleengine.ruleengine.rule.domain.ActionType;
import com.ruleengine.ruleengine.rule.infrastructure.persistence.RuleDefinitionEntity;

@Component
public class RuleMapper {

    public RuleDefinitionEntity toEntity(RuleCreateRequest request) {
        RuleDefinitionEntity entity = new RuleDefinitionEntity();
        entity.setName(request.name());
        entity.setDescription(request.description());
        entity.setCategory(request.category());
        entity.setPriority(request.priority());
        entity.setActive(Boolean.TRUE.equals(request.isActive()));
        entity.setAst(toAstMap(request.ast()));
        entity.setActions(toActionMaps(request.actions()));
        return entity;
    }

    public RuleResponse toResponse(RuleDefinitionEntity entity) {
        return toResponse(entity, false, List.of());
    }

    public RuleResponse toResponse(RuleDefinitionEntity entity, boolean hasConflicts, List<String> conflictDetails) {
        return new RuleResponse(
                entity.getId(),
                entity.getName(),
                entity.getDescription(),
                entity.getCategory(),
                entity.getPriority(),
                entity.isActive(),
                toAstDto(entity.getAst()),
                toActionDtos(entity.getActions()),
                entity.getVersion(),
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                hasConflicts,
                conflictDetails);
    }

    public Map<String, Object> toAstMap(AstNodeDto ast) {
        if (ast instanceof ConditionNodeDto condition) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("type", condition.type());
            map.put("field", condition.field());
            map.put("operator", condition.operator());
            map.put("value", condition.value());
            return map;
        }
        if (ast instanceof LogicNodeDto logic) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("type", logic.type());
            map.put("children", logic.children().stream()
                    .map(this::toAstMap)
                    .toList());
            return map;
        }
        throw new IllegalArgumentException("Unsupported AST node type: " + ast.getClass().getName());
    }

    public AstNodeDto toAstDto(Map<String, Object> ast) {
        String type = stringValue(ast.get("type"));
        if ("CONDITION".equals(type)) {
            return new ConditionNodeDto(
                    type,
                    stringValue(ast.get("field")),
                    stringValue(ast.get("operator")),
                    ast.get("value"));
        }
        if ("AND".equals(type) || "OR".equals(type)) {
            return new LogicNodeDto(type, childrenFrom(ast.get("children")));
        }
        throw new IllegalArgumentException("Unsupported AST node type: " + type);
    }

    public List<Map<String, Object>> toActionMaps(List<ActionNodeDto> actions) {
        if (actions == null) {
            return List.of();
        }
        return actions.stream()
                .map(this::toActionMap)
                .toList();
    }

    public List<ActionNodeDto> toActionDtos(List<Map<String, Object>> actions) {
        if (actions == null) {
            return List.of();
        }
        return actions.stream()
                .map(this::toActionDto)
                .toList();
    }

    private Map<String, Object> toActionMap(ActionNodeDto action) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("type", action.type());
        map.put("actionType", action.actionType().name());
        map.put("params", action.params());
        return map;
    }

    @SuppressWarnings("unchecked")
    private ActionNodeDto toActionDto(Map<String, Object> action) {
        String actionType = stringValue(action.get("actionType"));
        Object params = action.get("params");
        Map<String, Object> paramMap = params instanceof Map<?, ?> map
                ? new LinkedHashMap<>((Map<String, Object>) map)
                : Map.of();
        return new ActionNodeDto(
                stringValueOrDefault(action.get("type"), "ACTION"),
                ActionType.valueOf(actionType),
                paramMap);
    }

    @SuppressWarnings("unchecked")
    private List<AstNodeDto> childrenFrom(Object children) {
        if (!(children instanceof List<?> childrenList)) {
            return List.of();
        }
        List<AstNodeDto> result = new ArrayList<>();
        for (Object child : childrenList) {
            if (child instanceof Map<?, ?> map) {
                result.add(toAstDto((Map<String, Object>) map));
            }
        }
        return result;
    }

    private String stringValue(Object value) {
        if (value == null) {
            return null;
        }
        return value.toString();
    }

    private String stringValueOrDefault(Object value, String defaultValue) {
        String stringValue = stringValue(value);
        return stringValue == null || stringValue.isBlank() ? defaultValue : stringValue;
    }
}
