package com.ruleengine.ruleengine.rule.application.impl;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ruleengine.ruleengine.rule.api.dto.RuleEvaluationRequest;
import com.ruleengine.ruleengine.rule.api.dto.RuleEvaluationResponse;
import com.ruleengine.ruleengine.rule.infrastructure.persistence.RuleExecutionLogEntity;
import com.ruleengine.ruleengine.rule.infrastructure.persistence.RuleExecutionLogRepository;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

@Service
public class RuleExecutionLogger {

    private final RuleExecutionLogRepository logRepository;
    private final ObjectMapper objectMapper;

    public RuleExecutionLogger(RuleExecutionLogRepository logRepository, ObjectMapper objectMapper) {
        this.logRepository = logRepository;
        this.objectMapper = objectMapper;
    }

    @Async
    @Transactional
    public void logExecutions(java.util.List<RuleExecutionLogEntity> logs) {
        logRepository.saveAll(logs);
    }

    @Async
    @Transactional
    public void logBatchExecution(UUID ruleId, java.util.List<com.ruleengine.ruleengine.rule.api.dto.RuleBatchEvaluationResponse.BatchResultDto> results, long executionTimeMs) {
        java.util.List<RuleExecutionLogEntity> logs = new java.util.ArrayList<>();
        for (com.ruleengine.ruleengine.rule.api.dto.RuleBatchEvaluationResponse.BatchResultDto result : results) {
            try {
                RuleExecutionLogEntity log = new RuleExecutionLogEntity();
                log.setRuleId(ruleId);
                log.setExecutionTimeMs(executionTimeMs);
                log.setFactPayload(objectMapper.writeValueAsString(result.fact()));
                
                RuleEvaluationResponse mockRes = new RuleEvaluationResponse(result.matched(), result.matches(), 1);
                log.setResult(objectMapper.writeValueAsString(mockRes));
                log.setMatched(result.matched());
                log.setCreatedAt(LocalDateTime.now());
                logs.add(log);
            } catch (JacksonException e) {
                // Ignore serialization error for this row
            }
        }
        if (!logs.isEmpty()) {
            logRepository.saveAll(logs);
        }
    }

    @Async
    @Transactional
    public void logExecution(RuleEvaluationRequest request, RuleEvaluationResponse response, long executionTimeMs) {
        try {
            RuleExecutionLogEntity log = new RuleExecutionLogEntity();
            
            UUID ruleId = request.ruleId();
            if (ruleId == null && response.matched() && !response.matchedRules().isEmpty()) {
                ruleId = response.matchedRules().get(0).ruleId();
            }
            
            log.setRuleId(ruleId);
            log.setExecutionTimeMs(executionTimeMs);
            log.setFactPayload(objectMapper.writeValueAsString(request.facts()));
            log.setResult(objectMapper.writeValueAsString(response));
            log.setMatched(response.matched());
            log.setCreatedAt(LocalDateTime.now());

            logRepository.save(log);
        } catch (JacksonException e) {
            // Log serialization errors can be ignored for now
        }
    }
}
