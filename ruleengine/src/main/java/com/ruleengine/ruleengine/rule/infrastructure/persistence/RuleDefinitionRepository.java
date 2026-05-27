package com.ruleengine.ruleengine.rule.infrastructure.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface RuleDefinitionRepository extends JpaRepository<RuleDefinitionEntity, UUID>,
        JpaSpecificationExecutor<RuleDefinitionEntity> {

    List<RuleDefinitionEntity> findByActiveTrueOrderByPriorityDescCreatedAtAsc();

    Optional<RuleDefinitionEntity> findByIdAndActiveTrue(UUID id);

    boolean existsByNameIgnoreCase(String name);
    
    java.util.List<RuleDefinitionEntity> findByActiveTrue();
}
