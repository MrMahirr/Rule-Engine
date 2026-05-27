package com.ruleengine.ruleengine.field.infrastructure;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FieldDefinitionRepository extends JpaRepository<FieldDefinitionEntity, UUID> {

    Optional<FieldDefinitionEntity> findByName(String name);

    boolean existsByNameIgnoreCase(String name);
}
