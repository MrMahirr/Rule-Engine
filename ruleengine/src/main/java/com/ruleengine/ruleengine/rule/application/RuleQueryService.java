package com.ruleengine.ruleengine.rule.application;

import java.util.UUID;

import org.springframework.data.domain.Pageable;

import com.ruleengine.ruleengine.common.api.PaginatedResponse;
import com.ruleengine.ruleengine.rule.api.dto.RuleResponse;

public interface RuleQueryService {

    RuleResponse getRule(UUID id);

    PaginatedResponse<RuleResponse> getRules(String category, Boolean active, String search, Pageable pageable);

    java.util.List<com.ruleengine.ruleengine.rule.api.dto.RuleVersionDto> getRuleVersions(UUID ruleId);
}
