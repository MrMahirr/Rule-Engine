package com.ruleengine.ruleengine.rule.infrastructure.persistence;

import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface RuleExecutionLogRepository extends JpaRepository<RuleExecutionLogEntity, UUID> {
    
    long countByMatched(boolean matched);

    @Query("SELECT r.ruleId, COUNT(r) as triggerCount FROM RuleExecutionLogEntity r WHERE r.matched = true GROUP BY r.ruleId ORDER BY triggerCount DESC")
    java.util.List<Object[]> findTopTriggeredRules(Pageable pageable);

}
