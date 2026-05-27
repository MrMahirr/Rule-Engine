import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RulePayload } from '../types/ast.types';
import { ruleKeys } from './ruleQueryKeys';
import { RuleFilters } from '../../RuleList/types/ruleList.types';
import { RuleApi } from './ruleApi';

export function useRulesQuery(filters: RuleFilters) {
  return useQuery({
    queryKey: ruleKeys.list(filters),
    queryFn: () => RuleApi.getAll(filters),
  });
}

export function useRuleByIdQuery(id: string) {
  return useQuery({
    queryKey: ruleKeys.detail(id),
    queryFn: () => RuleApi.getById(id),
    enabled: !!id,
  });
}

export function useSaveRuleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: RuleApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ruleKeys.lists() });
    },
  });
}

export function useUpdateRuleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: RuleApi.update,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ruleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ruleKeys.detail(variables.id) });
    },
  });
}

export function useDeleteRuleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: RuleApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ruleKeys.lists() });
    },
  });
}

export function useToggleRuleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: RuleApi.toggle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ruleKeys.lists() });
    },
  });
}

export function useEvaluateRuleMutation() {
  return useMutation({
    mutationFn: RuleApi.evaluate,
  });
}

export function useBatchEvaluateMutation() {
  return useMutation({
    mutationFn: RuleApi.evaluateBatch,
  });
}

export function useRuleVersionsQuery(ruleId: string) {
  return useQuery({
    queryKey: [...ruleKeys.detail(ruleId), 'versions'],
    queryFn: () => RuleApi.getVersions(ruleId),
    enabled: !!ruleId,
  });
}

export function useRestoreVersionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: RuleApi.restoreVersion,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ruleKeys.detail(variables.ruleId) });
      queryClient.invalidateQueries({ queryKey: ruleKeys.lists() });
    },
  });
}
