import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, replaceParams } from '../../../shared/api/apiClient';
import { ApiEndpoint, HttpMethod } from '../../../shared/api/endpoints';
import { RulePayload, RuleResponse, RuleEvaluationResponse } from '../types/ast.types';
import { ruleKeys } from './ruleQueryKeys';
import { RuleFilters } from '../../RuleList/types/ruleList.types';
import { ApiResponse, PaginatedResponse } from '../../../shared/api/types';

export function useRulesQuery(filters: RuleFilters) {
  return useQuery({
    queryKey: ruleKeys.list(filters),
    queryFn: () =>
      apiClient.request<PaginatedResponse<RuleResponse>>({
        endpoint: ApiEndpoint.GET_ALL_RULES,
        method: HttpMethod.GET,
        params: {
          ...filters,
          page: (filters.page ?? 1) - 1, // Backend 0-indexed
        },
      }),
  });
}

export function useRuleByIdQuery(id: string) {
  return useQuery({
    queryKey: ruleKeys.detail(id),
    queryFn: () =>
      apiClient.request<ApiResponse<RuleResponse>>({
        endpoint: replaceParams(ApiEndpoint.GET_RULE_BY_ID, { id }),
        method: HttpMethod.GET,
      }),
    enabled: !!id,
  });
}

export function useSaveRuleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RulePayload) =>
      apiClient.request<ApiResponse<RuleResponse>>({
        endpoint: ApiEndpoint.SAVE_RULE,
        method: HttpMethod.POST,
        data: payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ruleKeys.lists() });
    },
  });
}

export function useUpdateRuleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RulePayload }) =>
      apiClient.request<ApiResponse<RuleResponse>>({
        endpoint: replaceParams(ApiEndpoint.UPDATE_RULE, { id }),
        method: HttpMethod.PUT,
        data: payload,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ruleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ruleKeys.detail(variables.id) });
    },
  });
}

export function useDeleteRuleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.request<ApiResponse<void>>({
        endpoint: replaceParams(ApiEndpoint.DELETE_RULE, { id }),
        method: HttpMethod.DELETE,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ruleKeys.lists() });
    },
  });
}

export function useToggleRuleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiClient.request<ApiResponse<void>>({
        endpoint: replaceParams(ApiEndpoint.TOGGLE_RULE, { id }),
        method: HttpMethod.PATCH,
        data: { isActive },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ruleKeys.lists() });
    },
  });
}

export function useEvaluateRuleMutation() {
  return useMutation({
    mutationFn: (payload: { ruleId?: string; facts: Record<string, any> }) =>
      apiClient.request<ApiResponse<any>>({
        endpoint: ApiEndpoint.EVALUATE_RULE,
        method: HttpMethod.POST,
        data: payload,
      }),
  });
}

export function useBatchEvaluateMutation() {
  return useMutation({
    mutationFn: (payload: { ruleId?: string; factsList: Record<string, any>[] }) =>
      apiClient.request<ApiResponse<any>>({
        endpoint: ApiEndpoint.EVALUATE_BATCH,
        method: HttpMethod.POST,
        data: payload,
      }),
  });
}

export function useRuleVersionsQuery(ruleId: string) {
  return useQuery({
    queryKey: [...ruleKeys.detail(ruleId), 'versions'],
    queryFn: () =>
      apiClient.request<ApiResponse<any>>({
        endpoint: ApiEndpoint.GET_RULE_VERSIONS.replace(':id', ruleId),
        method: HttpMethod.GET,
      }),
    enabled: !!ruleId,
  });
}

export function useRestoreVersionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ruleId, versionId }: { ruleId: string; versionId: string }) =>
      apiClient.request<ApiResponse<RuleResponse>>({
        endpoint: ApiEndpoint.RESTORE_RULE_VERSION.replace(':id', ruleId).replace(':versionId', versionId),
        method: HttpMethod.POST,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ruleKeys.detail(variables.ruleId) });
      queryClient.invalidateQueries({ queryKey: ruleKeys.lists() });
    },
  });
}
