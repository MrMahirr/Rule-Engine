package com.ruleengine.ruleengine.field.application;

import java.util.List;
import java.util.UUID;

import com.ruleengine.ruleengine.field.api.dto.FieldCreateRequest;
import com.ruleengine.ruleengine.field.api.dto.FieldResponse;

public interface FieldService {

    FieldResponse createField(FieldCreateRequest request);

    List<FieldResponse> getFields();

    void deleteField(UUID id);
}
