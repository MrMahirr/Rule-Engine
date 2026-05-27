import React, { useState } from 'react';
import { Modal, Input, Button, SelectBox, useToast, Skeleton } from '../../../../shared/components';
import { useFieldsQuery, useCreateFieldMutation, useDeleteFieldMutation } from '../../services/useFieldQueries';
import { FieldPayload } from '../../types/field.types';
import { useConfirm } from '../../../../shared/hooks';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function FieldManagementModal({ isOpen, onClose }: Props) {
  const { data: fieldsData, isLoading } = useFieldsQuery();
  const createMutation = useCreateFieldMutation();
  const deleteMutation = useDeleteFieldMutation();
  const { success } = useToast();
  const { confirm } = useConfirm();

  const [newField, setNewField] = useState({ name: '', label: '', type: 'STRING', required: false });

  const fields = fieldsData?.data || [];
  const typeOptions = [
    { value: 'STRING', label: 'Metin' },
    { value: 'NUMBER', label: 'Sayı' },
    { value: 'BOOLEAN', label: 'Mantıksal (Bool)' },
    { value: 'DATE', label: 'Tarih' },
    { value: 'DATETIME', label: 'Tarih/Saat' },
    { value: 'ENUM', label: 'Enum' }
  ];

  const handleAddField = async () => {
    if (!newField.name.trim() || !newField.label.trim()) return;
    try {
      await createMutation.mutateAsync({
        name: newField.name.trim(),
        label: newField.label.trim(),
        type: newField.type as FieldPayload['type'],
        required: newField.required,
      });
      setNewField({ name: '', label: '', type: 'STRING', required: false });
      success('Alan Eklendi', `'${newField.name.trim()}' havuza eklendi.`);
    } catch (error) {
      console.error('Field creation failed', error);
    }
  };

  const handleDeleteField = async (id: string) => {
    const isConfirmed = await confirm({
      title: 'Alanı Sil',
      message: 'Bu alanı havuzdan silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
      confirmText: 'Evet, Sil',
      isDestructive: true
    });

    if (isConfirmed) {
      await deleteMutation.mutateAsync(id);
      success('Alan Silindi', 'Alan havuzdan kaldırıldı.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Alan Havuzunu Yönet" width="600px">
      <div className="flex flex-col gap-6 p-2">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end w-full">
            <Input 
              label="Alan Adı (örn: age)" 
              value={newField.name} 
              onChange={e => setNewField({...newField, name: e.target.value})}
              className="flex-1"
            />
            <Input 
              label="Etiket (örn: Yaş)" 
              value={newField.label} 
              onChange={e => setNewField({...newField, label: e.target.value})}
              className="flex-1"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end w-full">
            <div className="w-full sm:w-[160px]">
              <SelectBox 
                label="Tip"
                options={typeOptions}
                value={newField.type}
                onChange={(e) => setNewField({...newField, type: e.target.value})}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer mb-1">
              <input 
                type="checkbox" 
                checked={newField.required} 
                onChange={(e) => setNewField({...newField, required: e.target.checked})}
                className="accent-neon-blue w-4 h-4"
              />
              Zorunlu
            </label>
            <Button onClick={handleAddField} isLoading={createMutation.isPending} variant="primary" style={{ marginBottom: '1px' }}>
              <Plus size={16} /> Ekle
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-2 mt-4">
            <Skeleton count={3} height="60px" />
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2">
            <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">Kayıtlı Alanlar</h4>
            {fields.map(f => (
              <div key={f.id} className="flex items-center justify-between p-3 bg-space-900 border border-border-subtle rounded-lg hover:border-neon-blue transition-colors group">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-text-primary text-sm">{f.label} <span className="text-text-muted">({f.name})</span></span>
                  <span className="text-xs text-text-muted font-mono">{f.type}{f.required ? ' • Zorunlu' : ''}</span>
                </div>
                <button 
                  className="text-text-muted hover:text-red-400 p-2 rounded hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                  onClick={() => handleDeleteField(f.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {fields.length === 0 && (
              <div className="text-center p-8 text-text-muted border border-dashed border-border-subtle rounded-lg bg-space-900/50">
                Kayıtlı alan bulunamadı.
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
