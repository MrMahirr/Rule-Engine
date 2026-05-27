package com.ruleengine.ruleengine.rule.api.dto;

import java.util.List;
import java.util.Map;

public record RuleBatchEvaluationResponse(
        long totalRecords,
        long matchedRecords,
        long failedRecords,
        List<BatchResultDto> results) {
        
    public record BatchResultDto(
            Map<String, Object> fact,
            boolean matched,
            List<RuleMatchResult> matches) {}
}
