import { apiClient } from '../../../shared/api/apiClient';
import { ApiEndpoint, HttpMethod } from '../../../shared/api/endpoints';
import { ApiResponse } from '../../../shared/api/types';
import { DashboardMetrics, PageResponse, RuleExecutionLog } from './useMetricsQueries';

export const MetricsApi = {
  getDashboardMetrics: async () => {
    return apiClient.request<ApiResponse<DashboardMetrics>>({
      endpoint: ApiEndpoint.GET_DASHBOARD_METRICS,
      method: HttpMethod.GET,
    });
  },

  getAuditLogs: async (page: number = 0, size: number = 10) => {
    return apiClient.request<ApiResponse<PageResponse<RuleExecutionLog>>>({
      endpoint: `${ApiEndpoint.GET_AUDIT_LOGS}?page=${page}&size=${size}`,
      method: HttpMethod.GET,
    });
  },
};
