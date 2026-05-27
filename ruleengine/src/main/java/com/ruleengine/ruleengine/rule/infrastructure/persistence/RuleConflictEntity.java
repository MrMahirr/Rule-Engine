package com.ruleengine.ruleengine.rule.infrastructure.persistence;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "rule_conflicts")
public class RuleConflictEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "rule_id_1", nullable = false)
    private UUID ruleId1;

    @Column(name = "rule_id_2", nullable = false)
    private UUID ruleId2;

    @Column(name = "description", nullable = false)
    private String description;

    public RuleConflictEntity() {}

    public RuleConflictEntity(UUID ruleId1, UUID ruleId2, String description) {
        this.ruleId1 = ruleId1;
        this.ruleId2 = ruleId2;
        this.description = description;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getRuleId1() { return ruleId1; }
    public void setRuleId1(UUID ruleId1) { this.ruleId1 = ruleId1; }

    public UUID getRuleId2() { return ruleId2; }
    public void setRuleId2(UUID ruleId2) { this.ruleId2 = ruleId2; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
