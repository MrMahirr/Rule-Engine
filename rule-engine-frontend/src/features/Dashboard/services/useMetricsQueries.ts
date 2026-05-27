import { useQuery } from '@tanstack/react-query';
import { MetricsApi } from './metricsApi';

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
    queryFn: MetricsApi.getDashboardMetrics,
  });
}

export function useAuditLogs(page: number = 0, size: number = 10) {
  return useQuery({
    queryKey: metricsKeys.logs(page, size),
    queryFn: () => MetricsApi.getAuditLogs(page, size),
  });
}
