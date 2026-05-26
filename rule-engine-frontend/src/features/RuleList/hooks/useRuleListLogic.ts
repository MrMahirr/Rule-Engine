import { useState } from 'react';
import { RuleFilters } from '../types/ruleList.types';
import { useRulesQuery, useDeleteRuleMutation } from '../../RuleEditor/services/useRuleQueries';

export function useRuleListLogic() {
  const [filters, setFilters] = useState<RuleFilters>({
    page: 1,
    pageSize: 10,
    sortOrder: 'desc',
    sortBy: 'createdAt'
  });
  
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useRulesQuery(filters);
  const deleteMutation = useDeleteRuleMutation();

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu kuralı silmek istediğinize emin misiniz?')) {
      await deleteMutation.mutateAsync(id);
      if (selectedRuleId === id) {
        setSelectedRuleId(null);
      }
    }
  };

  return {
    rules: data?.data || [],
    total: data?.total || 0,
    isLoading,
    isError,
    error,
    filters,
    selectedRuleId,
    setSelectedRuleId,
    handleSearch,
    handleDelete,
    isDeleting: deleteMutation.isPending
  };
}
