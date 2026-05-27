package com.ruleengine.ruleengine;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;

import com.ruleengine.ruleengine.field.infrastructure.FieldDefinitionRepository;
import com.ruleengine.ruleengine.rule.infrastructure.persistence.RuleDefinitionRepository;

import static org.mockito.Mockito.mock;

@SpringBootTest(properties = {
        "spring.autoconfigure.exclude=org.springframework.boot.jdbc.autoconfigure.DataSourceAutoConfiguration,"
                + "org.springframework.boot.hibernate.autoconfigure.HibernateJpaAutoConfiguration,"
                + "org.springframework.boot.data.redis.autoconfigure.DataRedisRepositoriesAutoConfiguration",
        "spring.cache.type=simple"
})
class RuleengineApplicationTests {

    @Test
    void contextLoads() {
    }

    @TestConfiguration
    static class RepositoryTestConfig {

        @Bean
        RuleDefinitionRepository ruleDefinitionRepository() {
            return mock(RuleDefinitionRepository.class);
        }

        @Bean
        FieldDefinitionRepository fieldDefinitionRepository() {
            return mock(FieldDefinitionRepository.class);
        }
    }
}
