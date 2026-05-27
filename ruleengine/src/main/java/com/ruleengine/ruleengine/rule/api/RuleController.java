package com.ruleengine.ruleengine.rule.api;

import java.net.URI;
import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ruleengine.ruleengine.common.api.ApiResponse;
import com.ruleengine.ruleengine.common.api.PaginatedResponse;
import com.ruleengine.ruleengine.rule.api.dto.RuleCreateRequest;
import com.ruleengine.ruleengine.rule.api.dto.RuleEvaluationRequest;
import com.ruleengine.ruleengine.rule.api.dto.RuleEvaluationResponse;
import com.ruleengine.ruleengine.rule.api.dto.RuleResponse;
import com.ruleengine.ruleengine.rule.api.dto.RuleToggleRequest;
import com.ruleengine.ruleengine.rule.application.RuleCommandService;
import com.ruleengine.ruleengine.rule.application.RuleExecutionService;
import com.ruleengine.ruleengine.rule.application.RuleQueryService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

@RestController
@RequestMapping("/api/rules")
@Tag(name = "Rules", description = "Rule definition and evaluation endpoints")
public class RuleController {

    private final RuleCommandService commandService;
    private final RuleQueryService queryService;
    private final RuleExecutionService executionService;

    public RuleController(
            RuleCommandService commandService,
            RuleQueryService queryService,
            RuleExecutionService executionService) {
        this.commandService = commandService;
        this.queryService = queryService;
        this.executionService = executionService;
    }

    @PostMapping
    @Operation(summary = "Create rule")
    public ResponseEntity<ApiResponse<RuleResponse>> createRule(@Valid @RequestBody RuleCreateRequest request) {
        RuleResponse response = commandService.createRule(request);
        return ResponseEntity.created(URI.create("/api/rules/" + response.id()))
                .body(ApiResponse.success("Rule created", response));
    }

    @GetMapping
    @Operation(summary = "List rules")
    public PaginatedResponse<RuleResponse> getRules(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int pageSize) {
        Pageable pageable = PageRequest.of(page, pageSize);
        return queryService.getRules(category, active, search, pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get rule by id")
    public ApiResponse<RuleResponse> getRule(@PathVariable UUID id) {
        return ApiResponse.success("Rule retrieved", queryService.getRule(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete rule")
    public ResponseEntity<ApiResponse<Void>> deleteRule(@PathVariable UUID id) {
        commandService.deleteRule(id);
        return ResponseEntity.ok(ApiResponse.success("Rule deleted", null));
    }

    @PatchMapping("/{id}/toggle")
    @Operation(summary = "Toggle rule activation")
    public ApiResponse<RuleResponse> toggleRule(
            @PathVariable UUID id,
            @Valid @RequestBody RuleToggleRequest request) {
        return ApiResponse.success("Rule toggled", commandService.toggleRule(id, request));
    }

    @PostMapping("/evaluate")
    @Operation(summary = "Evaluate rules")
    public ApiResponse<RuleEvaluationResponse> evaluate(@Valid @RequestBody RuleEvaluationRequest request) {
        return ApiResponse.success("Evaluation completed", executionService.evaluate(request));
    }
}
