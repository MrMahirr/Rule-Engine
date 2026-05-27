import React from 'react';
import { useRuleVersionsQuery, useRestoreVersionMutation } from '../../services/useRuleQueries';
import { Modal, Button, useToast } from '../../../../shared/components';
import { History, ArrowLeftCircle } from 'lucide-react';
import { useConfirm } from '../../../../shared/hooks';

interface RuleVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  ruleId: string;
}

export function RuleVersionModal({ isOpen, onClose, ruleId }: RuleVersionModalProps) {
  const { data: versionsData, isLoading } = useRuleVersionsQuery(ruleId);
  const restoreMutation = useRestoreVersionMutation();
  const { success, error } = useToast();
  const { confirm } = useConfirm();

  const handleRestore = async (versionId: string, versionNumber: number) => {
    const isConfirmed = await confirm({
      title: 'Versiyona Geri Dön',
      message: `Kural V${versionNumber} sürümüne geri döndürülecek. Emin misiniz?`,
      confirmText: 'Evet, Geri Dön',
      isDestructive: false,
    });

    if (!isConfirmed) return;

    try {
      await restoreMutation.mutateAsync({ ruleId, versionId });
      success('Başarılı', `Kural V${versionNumber} sürümüne başarıyla döndürüldü.`);
      onClose(); // Kapat, RuleCanvas ruleByIdQuery üzerinden yeni veriyi çekecek.
    } catch (err) {
      error('Hata', 'Versiyona geri dönülürken bir hata oluştu.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Versiyon Geçmişi" maxWidth="md">
      <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-2">
        {isLoading && <div className="text-text-muted">Yükleniyor...</div>}
        
        {!isLoading && (!versionsData?.data || versionsData.data.length === 0) && (
          <div className="text-text-muted">Geçmiş versiyon bulunamadı.</div>
        )}

        {!isLoading && versionsData?.data?.map((v: any, index: number) => {
          const isLatest = index === 0;
          return (
            <div key={v.id} className={`flex items-center justify-between p-4 rounded-lg border ${isLatest ? 'bg-neon-blue/10 border-neon-blue/30' : 'bg-space-800 border-border-subtle'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${isLatest ? 'bg-neon-blue text-space-900' : 'bg-space-700 text-text-secondary'}`}>
                  <History size={16} />
                </div>
                <div>
                  <div className="text-sm font-bold text-text-primary flex items-center gap-2">
                    V{v.versionNumber}
                    {isLatest && <span className="text-[10px] bg-neon-blue text-space-900 px-2 py-0.5 rounded-full uppercase tracking-wider">Mevcut</span>}
                  </div>
                  <div className="text-xs text-text-secondary mt-1">
                    {new Date(v.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
              
              {!isLatest && (
                <Button 
                  size="sm" 
                  variant="secondary" 
                  onClick={() => handleRestore(v.id, v.versionNumber)}
                  isLoading={restoreMutation.isPending}
                >
                  <ArrowLeftCircle size={14} /> Geri Dön
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
