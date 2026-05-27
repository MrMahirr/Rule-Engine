package com.ruleengine.ruleengine.rule.api;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ruleengine.ruleengine.common.api.ApiResponse;
import com.ruleengine.ruleengine.rule.api.dto.DashboardMetricsDto;
import com.ruleengine.ruleengine.rule.api.dto.RuleExecutionLogDto;
import com.ruleengine.ruleengine.rule.infrastructure.persistence.RuleDefinitionEntity;
import com.ruleengine.ruleengine.rule.infrastructure.persistence.RuleDefinitionRepository;
import com.ruleengine.ruleengine.rule.infrastructure.persistence.RuleExecutionLogEntity;
import com.ruleengine.ruleengine.rule.infrastructure.persistence.RuleExecutionLogRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/metrics")
@Tag(name = "Metrics API", description = "Endpoints for dashboard metrics and audit logs")
public class MetricsController {

    private final RuleExecutionLogRepository logRepository;
    private final RuleDefinitionRepository ruleRepository;

    public MetricsController(RuleExecutionLogRepository logRepository, RuleDefinitionRepository ruleRepository) {
        this.logRepository = logRepository;
        this.ruleRepository = ruleRepository;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get dashboard metrics")
    public ApiResponse<DashboardMetricsDto> getDashboardMetrics() {
        long total = logRepository.count();
        long matched = logRepository.countByMatched(true);
        long failed = total - matched;

        List<Object[]> topRulesData = logRepository.findTopTriggeredRules(PageRequest.of(0, 5));
        
        List<DashboardMetricsDto.TopRuleDto> topRules = topRulesData.stream().map(data -> {
            UUID ruleId = (UUID) data[0];
            long count = (long) data[1];
            String ruleName = "Unknown Rule";
            if (ruleId != null) {
                ruleName = ruleRepository.findById(ruleId)
                        .map(RuleDefinitionEntity::getName)
                        .orElse("Deleted Rule (" + ruleId + ")");
            }
            return new DashboardMetricsDto.TopRuleDto(ruleId == null ? "" : ruleId.toString(), ruleName, count);
        }).collect(Collectors.toList());

        DashboardMetricsDto dto = new DashboardMetricsDto(total, matched, failed, topRules);
        return ApiResponse.success("Metrics retrieved", dto);
    }

    @GetMapping("/logs")
    @Operation(summary = "Get execution logs")
    public ApiResponse<Page<RuleExecutionLogDto>> getLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
            
        Page<RuleExecutionLogEntity> logEntities = logRepository.findAll(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
                
        Page<RuleExecutionLogDto> dtoPage = logEntities.map(log -> {
            String ruleName = "Unknown/All";
            if (log.getRuleId() != null) {
                ruleName = ruleRepository.findById(log.getRuleId())
                        .map(RuleDefinitionEntity::getName)
                        .orElse("Deleted");
            }
            return new RuleExecutionLogDto(
                    log.getId(),
                    log.getRuleId(),
                    ruleName,
                    log.getExecutionTimeMs(),
                    log.getFactPayload(),
                    log.getResult(),
                    log.isMatched(),
                    log.getCreatedAt());
        });

        return ApiResponse.success("Logs retrieved", dtoPage);
    }
}
