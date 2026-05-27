import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/apiClient';
import { ApiEndpoint, HttpMethod } from '../../../shared/api/endpoints';
import { ApiResponse } from '../../../shared/api/types';

export interface DashboardMetrics {
  totalEvaluations: number;
  matchedEvaluations: number;
  failedEvaluations: number;
  topTriggeredRules: { ruleId: string; ruleName: string; triggerCount: number }[];
}

export interface RuleExecutionLog {
  id: string;
  ruleId: string;
  ruleName: string;
  executionTimeMs: number;
  factPayload: string;
  result: string;
  matched: boolean;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const metricsKeys = {
  all: ['metrics'] as const,
  dashboard: () => [...metricsKeys.all, 'dashboard'] as const,
  logs: (page: number, size: number) => [...metricsKeys.all, 'logs', page, size] as const,
};

export function useDashboardMetrics() {
  return useQuery({
    queryKey: metricsKeys.dashboard(),
    queryFn: () =>
      apiClient.request<ApiResponse<DashboardMetrics>>({
        endpoint: ApiEndpoint.GET_DASHBOARD_METRICS,
        method: HttpMethod.GET,
      }),
  });
}

export function useAuditLogs(page: number = 0, size: number = 10) {
  return useQuery({
    queryKey: metricsKeys.logs(page, size),
    queryFn: () =>
      apiClient.request<ApiResponse<PageResponse<RuleExecutionLog>>>({
        endpoint: `${ApiEndpoint.GET_AUDIT_LOGS}?page=${page}&size=${size}`,
        method: HttpMethod.GET,
      }),
  });
}
