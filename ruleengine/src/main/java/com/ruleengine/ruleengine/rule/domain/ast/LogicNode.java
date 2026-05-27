package com.ruleengine.ruleengine.rule.domain.ast;

import java.util.List;

public record LogicNode(
        LogicType logicType,
        List<AstNode> children) implements AstNode {

    public LogicNode {
        children = children == null ? List.of() : List.copyOf(children);
    }

    @Override
    public String type() {
        return logicType.name();
    }

    public enum LogicType {
        AND,
        OR
    }
}
