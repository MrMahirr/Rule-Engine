package com.ruleengine.ruleengine.rule.application.impl;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ruleengine.ruleengine.rule.infrastructure.persistence.RuleConflictEntity;
import com.ruleengine.ruleengine.rule.infrastructure.persistence.RuleConflictRepository;
import com.ruleengine.ruleengine.rule.infrastructure.persistence.RuleDefinitionEntity;
import com.ruleengine.ruleengine.rule.infrastructure.persistence.RuleDefinitionRepository;

@Service
public class RuleConflictAnalyzer {

    private final RuleDefinitionRepository ruleRepository;
    private final RuleConflictRepository conflictRepository;

    public RuleConflictAnalyzer(RuleDefinitionRepository ruleRepository, RuleConflictRepository conflictRepository) {
        this.ruleRepository = ruleRepository;
        this.conflictRepository = conflictRepository;
    }

    @Async
    @Transactional
    public void analyzeAndSaveConflicts(UUID ruleId) {
        RuleDefinitionEntity newRule = ruleRepository.findById(ruleId).orElse(null);
        if (newRule == null || !newRule.isActive()) {
            conflictRepository.deleteByRuleId1OrRuleId2(ruleId, ruleId);
            return;
        }

        conflictRepository.deleteByRuleId1OrRuleId2(ruleId, ruleId);

        List<RuleDefinitionEntity> otherRules = ruleRepository.findByActiveTrue();
        
        Set<String> newRuleFields = extractFields(newRule.getAst());
        Set<String> newRuleActions = extractActions(newRule.getActions());

        for (RuleDefinitionEntity otherRule : otherRules) {
            if (otherRule.getId().equals(ruleId)) continue;

            Set<String> otherRuleFields = extractFields(otherRule.getAst());
            Set<String> otherRuleActions = extractActions(otherRule.getActions());

            // Simple conflict logic: If they share a field and have opposing primary actions (ALLOW vs DENY)
            boolean sharesField = newRuleFields.stream().anyMatch(otherRuleFields::contains);
            boolean opposingActions = 
                    (newRuleActions.contains("ALLOW") && otherRuleActions.contains("DENY")) ||
                    (newRuleActions.contains("DENY") && otherRuleActions.contains("ALLOW"));

            if (sharesField && opposingActions) {
                String description = "Çelişen kural: " + otherRule.getName() + " (Farklı aksiyonlar)";
                conflictRepository.save(new RuleConflictEntity(ruleId, otherRule.getId(), description));
                
                String descriptionRev = "Çelişen kural: " + newRule.getName() + " (Farklı aksiyonlar)";
                conflictRepository.save(new RuleConflictEntity(otherRule.getId(), ruleId, descriptionRev));
            }
        }
    }

    @SuppressWarnings("unchecked")
    private Set<String> extractFields(Map<String, Object> ast) {
        Set<String> fields = new HashSet<>();
        if (ast == null) return fields;

        if ("CONDITION".equals(ast.get("type"))) {
            if (ast.get("field") != null) {
                fields.add(ast.get("field").toString());
            }
        } else if ("LOGIC_GATE".equals(ast.get("type"))) {
            List<Map<String, Object>> children = (List<Map<String, Object>>) ast.get("children");
            if (children != null) {
                for (Map<String, Object> child : children) {
                    fields.addAll(extractFields(child));
                }
            }
        }
        return fields;
    }

    private Set<String> extractActions(List<Map<String, Object>> actions) {
        Set<String> actionTypes = new HashSet<>();
        if (actions == null) return actionTypes;

        for (Map<String, Object> action : actions) {
            if (action.get("actionType") != null) {
                actionTypes.add(action.get("actionType").toString());
            }
        }
        return actionTypes;
    }
}
