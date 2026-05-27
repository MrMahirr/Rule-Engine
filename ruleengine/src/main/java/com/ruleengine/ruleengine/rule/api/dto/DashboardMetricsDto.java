package com.ruleengine.ruleengine.rule.api.dto;

import java.util.List;

public record DashboardMetricsDto(
        long totalEvaluations,
        long matchedEvaluations,
        long failedEvaluations,
        List<TopRuleDto> topTriggeredRules) {
        
    public record TopRuleDto(String ruleId, String ruleName, long triggerCount) {}
}
