package com.ruleengine.ruleengine.rule.application;

import com.ruleengine.ruleengine.rule.api.dto.RuleEvaluationRequest;
import com.ruleengine.ruleengine.rule.api.dto.RuleEvaluationResponse;

public interface RuleExecutionService {

    RuleEvaluationResponse evaluate(RuleEvaluationRequest request);
}
