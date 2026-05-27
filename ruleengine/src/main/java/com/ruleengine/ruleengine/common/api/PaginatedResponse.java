package com.ruleengine.ruleengine.common.api;

import java.util.List;

import org.springframework.data.domain.Page;

public record PaginatedResponse<T>(
        List<T> data,
        long total,
        int page,
        int pageSize) {

    public PaginatedResponse {
        data = data == null ? List.of() : List.copyOf(data);
    }

    public static <T> PaginatedResponse<T> from(Page<T> page) {
        return new PaginatedResponse<>(
                page.getContent(),
                page.getTotalElements(),
                page.getNumber(),
                page.getSize());
    }
}
