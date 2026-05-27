package com.ruleengine.ruleengine.rule.api;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.ruleengine.ruleengine.rule.api.dto.RuleEvaluationResponse;
import com.ruleengine.ruleengine.rule.application.RuleCommandService;
import com.ruleengine.ruleengine.rule.application.RuleExecutionService;
import com.ruleengine.ruleengine.rule.application.RuleQueryService;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RuleController.class)
class RuleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RuleCommandService commandService;

    @MockitoBean
    private RuleQueryService queryService;

    @MockitoBean
    private RuleExecutionService executionService;

    @Test
    void evaluateReturnsStandardApiResponse() throws Exception {
        when(executionService.evaluate(any())).thenReturn(new RuleEvaluationResponse(true, List.of(), 2));

        mockMvc.perform(post("/api/rules/evaluate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "facts": {
                                    "orderAmount": 1500
                                  }
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Evaluation completed"))
                .andExpect(jsonPath("$.data.matched").value(true))
                .andExpect(jsonPath("$.data.evaluatedRuleCount").value(2));
    }
}
