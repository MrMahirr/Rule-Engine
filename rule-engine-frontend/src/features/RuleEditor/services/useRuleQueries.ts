import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, replaceParams } from '../../../shared/api/apiClient';
import { ApiEndpoint, HttpMethod } from '../../../shared/api/endpoints';
import { RulePayload, RuleResponse } from '../types/ast.types';
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
        params: filters,
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
    mutationFn: (payload: { ruleId: string; data: any }) =>
      apiClient.request<ApiResponse<any>>({
        endpoint: ApiEndpoint.EVALUATE_RULE,
        method: HttpMethod.POST,
        data: payload,
      }),
  });
}
