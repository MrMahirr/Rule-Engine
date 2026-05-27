package com.ruleengine.ruleengine.rule.infrastructure.persistence;

import org.springframework.data.jpa.domain.Specification;

public final class RuleDefinitionSpecification {

    private RuleDefinitionSpecification() {
    }

    public static Specification<RuleDefinitionEntity> active(Boolean active) {
        return (root, query, criteriaBuilder) -> active == null
                ? criteriaBuilder.conjunction()
                : criteriaBuilder.equal(root.get("active"), active);
    }

    public static Specification<RuleDefinitionEntity> category(String category) {
        return (root, query, criteriaBuilder) -> category == null || category.isBlank()
                ? criteriaBuilder.conjunction()
                : criteriaBuilder.equal(root.get("category"), category);
    }

    public static Specification<RuleDefinitionEntity> nameContains(String name) {
        return (root, query, criteriaBuilder) -> name == null || name.isBlank()
                ? criteriaBuilder.conjunction()
                : criteriaBuilder.like(criteriaBuilder.lower(root.get("name")),
                        "%" + name.toLowerCase() + "%");
    }
}
