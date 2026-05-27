package com.ruleengine.ruleengine.rule.application;

import com.ruleengine.ruleengine.rule.api.dto.RuleEvaluationRequest;
import com.ruleengine.ruleengine.rule.api.dto.RuleEvaluationResponse;

public interface RuleExecutionService {

    RuleEvaluationResponse evaluate(RuleEvaluationRequest request);
    
    com.ruleengine.ruleengine.rule.api.dto.RuleBatchEvaluationResponse evaluateBatch(com.ruleengine.ruleengine.rule.api.dto.RuleBatchEvaluationRequest request);
}
