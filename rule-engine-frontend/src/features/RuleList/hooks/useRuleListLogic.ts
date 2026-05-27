import { useState } from 'react';
import { RuleFilters } from '../types/ruleList.types';
import { useRulesQuery, useDeleteRuleMutation, useToggleRuleMutation, useSaveRuleMutation } from '../../RuleEditor/services/useRuleQueries';
import { useToast } from '../../../shared/components';
import { useConfirm } from '../../../shared/hooks';
import { RuleResponse } from '../../RuleEditor/types/ast.types';

export function useRuleListLogic(
  selectedRuleId: string | null,
  setSelectedRuleId: (id: string | null) => void
) {
  const [filters, setFilters] = useState<RuleFilters>({
    page: 1,
    pageSize: 10,
    sortOrder: 'desc',
    sortBy: 'createdAt'
  });

  const { data, isLoading, isError, error } = useRulesQuery(filters);
  const deleteMutation = useDeleteRuleMutation();
  const toggleMutation = useToggleRuleMutation();
  const saveMutation = useSaveRuleMutation();
  const { success } = useToast();
  const { confirm } = useConfirm();

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
  };

  const handleDelete = async (id: string, name: string) => {
    const isConfirmed = await confirm({
      title: 'Kuralı Sil',
      message: `'${name}' adlı kuralı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
      confirmText: 'Evet, Sil',
      isDestructive: true
    });
    if (isConfirmed) {
      await deleteMutation.mutateAsync(id);
      success('Silindi', 'Kural başarıyla silindi.');
      if (selectedRuleId === id) {
        setSelectedRuleId(null);
      }
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    await toggleMutation.mutateAsync({ id, isActive: !currentStatus });
    success('Durum Güncellendi', `Kural ${!currentStatus ? 'aktif' : 'pasif'} duruma getirildi.`);
  };

  const handleClone = async (rule: RuleResponse) => {
    try {
      await saveMutation.mutateAsync({
        name: `${rule.name} (Kopya)`,
        description: rule.description,
        category: rule.category || 'Genel',
        isActive: false, // Kopyalanan kurallar varsayılan pasif başlasın
        ast: rule.ast,
        actions: rule.actions || []
      });
      success('Kopyalandı', 'Kuralın kopyası oluşturuldu.');
    } catch (err) {
      console.error(err);
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
    handleToggle,
    handleClone,
    isDeleting: deleteMutation.isPending,
    isToggling: toggleMutation.isPending,
    isSaving: saveMutation.isPending
  };
}
