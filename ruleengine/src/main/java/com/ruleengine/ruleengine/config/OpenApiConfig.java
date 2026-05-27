package com.ruleengine.ruleengine.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI ruleEngineOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Rule Engine API")
                        .description("API for managing and evaluating rule definitions.")
                        .version("v1"));
    }
}
