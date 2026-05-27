package com.ruleengine.ruleengine.field.api;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.ruleengine.ruleengine.field.api.dto.FieldResponse;
import com.ruleengine.ruleengine.field.application.FieldService;
import com.ruleengine.ruleengine.field.domain.FieldType;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(FieldController.class)
class FieldControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private FieldService fieldService;

    @Test
    void createFieldReturnsCreatedApiResponse() throws Exception {
        UUID id = UUID.randomUUID();
        when(fieldService.createField(any())).thenReturn(new FieldResponse(
                id,
                "orderAmount",
                "Order Amount",
                FieldType.NUMBER,
                true,
                List.of(),
                Instant.parse("2026-05-27T00:00:00Z"),
                Instant.parse("2026-05-27T00:00:00Z")));

        mockMvc.perform(post("/api/fields")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "orderAmount",
                                  "label": "Order Amount",
                                  "type": "NUMBER",
                                  "required": true,
                                  "allowedValues": []
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Field created"))
                .andExpect(jsonPath("$.data.id").value(id.toString()))
                .andExpect(jsonPath("$.data.name").value("orderAmount"));
    }
}
