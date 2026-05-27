package com.ruleengine.ruleengine.rule.infrastructure.persistence;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface RuleVersionRepository extends JpaRepository<RuleVersionEntity, UUID> {
    
    List<RuleVersionEntity> findByRuleIdOrderByVersionNumberDesc(UUID ruleId);

    @Query("SELECT COALESCE(MAX(v.versionNumber), 0) FROM RuleVersionEntity v WHERE v.ruleId = :ruleId")
    Integer findMaxVersionByRuleId(UUID ruleId);
}
