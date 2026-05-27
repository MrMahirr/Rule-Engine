import { apiClient, replaceParams } from '../../../shared/api/apiClient';
import { ApiEndpoint, HttpMethod } from '../../../shared/api/endpoints';
import { RulePayload, RuleResponse } from '../types/ast.types';
import { RuleFilters } from '../../RuleList/types/ruleList.types';
import { ApiResponse, PaginatedResponse } from '../../../shared/api/types';

export const RuleApi = {
  getAll: async (filters: RuleFilters) => {
    return apiClient.request<PaginatedResponse<RuleResponse>>({
      endpoint: ApiEndpoint.GET_ALL_RULES,
      method: HttpMethod.GET,
      params: {
        ...filters,
        page: (filters.page ?? 1) - 1, // Backend 0-indexed
      },
    });
  },

  getById: async (id: string) => {
    return apiClient.request<ApiResponse<RuleResponse>>({
      endpoint: replaceParams(ApiEndpoint.GET_RULE_BY_ID, { id }),
      method: HttpMethod.GET,
    });
  },

  create: async (payload: RulePayload) => {
    return apiClient.request<ApiResponse<RuleResponse>>({
      endpoint: ApiEndpoint.SAVE_RULE,
      method: HttpMethod.POST,
      data: payload,
    });
  },

  update: async ({ id, payload }: { id: string; payload: RulePayload }) => {
    return apiClient.request<ApiResponse<RuleResponse>>({
      endpoint: replaceParams(ApiEndpoint.UPDATE_RULE, { id }),
      method: HttpMethod.PUT,
      data: payload,
    });
  },

  delete: async (id: string) => {
    return apiClient.request<ApiResponse<void>>({
      endpoint: replaceParams(ApiEndpoint.DELETE_RULE, { id }),
      method: HttpMethod.DELETE,
    });
  },

  toggle: async ({ id, isActive }: { id: string; isActive: boolean }) => {
    return apiClient.request<ApiResponse<void>>({
      endpoint: replaceParams(ApiEndpoint.TOGGLE_RULE, { id }),
      method: HttpMethod.PATCH,
      data: { isActive },
    });
  },

  evaluate: async (payload: { ruleId?: string; facts: Record<string, any> }) => {
    return apiClient.request<ApiResponse<any>>({
      endpoint: ApiEndpoint.EVALUATE_RULE,
      method: HttpMethod.POST,
      data: payload,
    });
  },

  evaluateBatch: async (payload: { ruleId?: string; factsList: Record<string, any>[] }) => {
    return apiClient.request<ApiResponse<any>>({
      endpoint: ApiEndpoint.EVALUATE_BATCH,
      method: HttpMethod.POST,
      data: payload,
    });
  },

  getVersions: async (ruleId: string) => {
    return apiClient.request<ApiResponse<any>>({
      endpoint: ApiEndpoint.GET_RULE_VERSIONS.replace(':id', ruleId),
      method: HttpMethod.GET,
    });
  },

  restoreVersion: async ({ ruleId, versionId }: { ruleId: string; versionId: string }) => {
    return apiClient.request<ApiResponse<RuleResponse>>({
      endpoint: ApiEndpoint.RESTORE_RULE_VERSION.replace(':id', ruleId).replace(':versionId', versionId),
      method: HttpMethod.POST,
    });
  },
};
