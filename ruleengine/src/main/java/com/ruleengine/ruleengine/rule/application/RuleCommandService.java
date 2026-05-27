package com.ruleengine.ruleengine.rule.application;

import java.util.UUID;

import com.ruleengine.ruleengine.rule.api.dto.RuleCreateRequest;
import com.ruleengine.ruleengine.rule.api.dto.RuleResponse;
import com.ruleengine.ruleengine.rule.api.dto.RuleToggleRequest;
import com.ruleengine.ruleengine.rule.api.dto.RuleUpdateRequest;

public interface RuleCommandService {

    RuleResponse createRule(RuleCreateRequest request);

    RuleResponse toggleRule(UUID id, RuleToggleRequest request);

    RuleResponse updateRule(UUID id, RuleUpdateRequest request);

    void deleteRule(UUID id);
}
