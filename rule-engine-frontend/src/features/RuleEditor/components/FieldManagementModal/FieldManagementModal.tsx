import React, { useState } from 'react';
import { Modal, Input, Button, SelectBox, useToast, Skeleton } from '../../../../shared/components';
import { useFieldsQuery, useCreateFieldMutation, useDeleteFieldMutation, useUpdateFieldMutation } from '../../services/useFieldQueries';
import { FieldPayload } from '../../types/field.types';
import { useConfirm } from '../../../../shared/hooks';
import { Plus, Trash2, Edit2, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function FieldManagementModal({ isOpen, onClose }: Props) {
  const { data: fieldsData, isLoading } = useFieldsQuery();
  const createMutation = useCreateFieldMutation();
  const updateMutation = useUpdateFieldMutation();
  const deleteMutation = useDeleteFieldMutation();
  const { success, error } = useToast();
  const { confirm } = useConfirm();

  const [newField, setNewField] = useState({ name: '', label: '', type: 'STRING', required: false, allowedValuesStr: '' });
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [bulkJson, setBulkJson] = useState<string>('{\n  "age": 25,\n  "isActive": true,\n  "name": "Mahir"\n}');

  const fields = fieldsData?.data || [];
  const typeOptions = [
    { value: 'STRING', label: 'Metin' },
    { value: 'NUMBER', label: 'Sayı' },
    { value: 'BOOLEAN', label: 'Mantıksal (Bool)' },
    { value: 'DATE', label: 'Tarih' },
    { value: 'DATETIME', label: 'Tarih/Saat' },
    { value: 'ENUM', label: 'Enum' }
  ];

  const handleSaveField = async () => {
    if (!newField.name.trim() || !newField.label.trim()) return;

    let allowedValues: string[] | undefined = undefined;
    if (newField.type === 'ENUM') {
      if (!newField.allowedValuesStr.trim()) {
        error('Hata', 'ENUM tipi için kabul edilen değerleri girmelisiniz.');
        return;
      }
      allowedValues = newField.allowedValuesStr
        .split(',')
        .map(v => v.trim())
        .filter(v => v !== '');
      
      if (!allowedValues || allowedValues.length === 0) {
        error('Hata', 'Lütfen geçerli değerler girin (Örn: VIP, STANDARD, PREMIUM)');
        return;
      }
    }

    try {
      if (editingFieldId) {
        await updateMutation.mutateAsync({
          id: editingFieldId,
          payload: {
            name: newField.name.trim(),
            label: newField.label.trim(),
            type: newField.type as FieldPayload['type'],
            required: newField.required,
            allowedValues: allowedValues,
          }
        });
        success('Alan Güncellendi', `'${newField.name.trim()}' başarıyla güncellendi.`);
        setEditingFieldId(null);
      } else {
        await createMutation.mutateAsync({
          name: newField.name.trim(),
          label: newField.label.trim(),
          type: newField.type as FieldPayload['type'],
          required: newField.required,
          allowedValues: allowedValues,
        });
        success('Alan Eklendi', `'${newField.name.trim()}' havuza eklendi.`);
      }
      setNewField({ name: '', label: '', type: 'STRING', required: false, allowedValuesStr: '' });
    } catch (err: any) {
      if (err?.response?.data?.message === 'Field name already exists') {
        error('Hata', 'Bu alan adı zaten kullanımda.');
      } else {
        error('Hata', 'İşlem başarısız oldu.');
      }
    }
  };

  const handleEditClick = (field: any) => {
    setEditingFieldId(field.id);
    setNewField({
      name: field.name,
      label: field.label,
      type: field.type,
      required: field.required,
      allowedValuesStr: field.allowedValues ? field.allowedValues.join(', ') : ''
    });
    setActiveTab('single');
  };

  const handleCancelEdit = () => {
    setEditingFieldId(null);
    setNewField({ name: '', label: '', type: 'STRING', required: false, allowedValuesStr: '' });
  };

  const handleBulkAdd = async () => {
    try {
      const parsed = JSON.parse(bulkJson);
      const keys = Object.keys(parsed);
      if (keys.length === 0) {
        error('Hata', 'JSON içeriği boş olamaz.');
        return;
      }

      let successCount = 0;
      let existCount = 0;

      for (const key of keys) {
        const value = parsed[key];
        let type: FieldPayload['type'] = 'STRING';
        if (typeof value === 'number') type = 'NUMBER';
        else if (typeof value === 'boolean') type = 'BOOLEAN';
        else if (typeof value === 'string') {
          if (!isNaN(Date.parse(value)) && isNaN(Number(value))) {
            type = value.includes('T') || value.includes(':') ? 'DATETIME' : 'DATE';
          }
        }

        const exists = fields.some((f: any) => f.name === key);
        if (exists) {
          existCount++;
          continue;
        }

        try {
          await createMutation.mutateAsync({
            name: key,
            label: key.charAt(0).toUpperCase() + key.slice(1),
            type: type,
            required: false,
          });
          successCount++;
        } catch (err) {
          console.error(`Failed to add ${key}`, err);
        }
      }

      if (successCount > 0) {
        success('Toplu Ekleme Başarılı', `${successCount} adet yeni alan eklendi.${existCount > 0 ? ` (${existCount} alan zaten vardı)` : ''}`);
        setBulkJson('');
        setActiveTab('single');
      } else if (existCount > 0) {
        error('Bilgi', 'Girilen tüm alanlar havuzda zaten mevcut.');
      } else {
        error('Hata', 'Alanlar eklenemedi.');
      }
    } catch (e) {
      error('Geçersiz JSON', 'Lütfen geçerli bir JSON formatı girin.');
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
      <div className="flex flex-col gap-4 p-2">
        <div className="flex border-b border-border-subtle gap-4">
          <button 
            onClick={() => setActiveTab('single')}
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'single' ? 'border-neon-blue text-neon-blue' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
          >
            Tekil Ekle
          </button>
          <button 
            onClick={() => setActiveTab('bulk')}
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'bulk' ? 'border-neon-blue text-neon-blue' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
          >
            Toplu Ekle (JSON)
          </button>
        </div>

        {activeTab === 'single' ? (
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
                onChange={(e) => setNewField({...newField, type: e.target.value, allowedValuesStr: ''})}
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
            <div className="flex items-center gap-2">
              <Button onClick={handleSaveField} isLoading={createMutation.isPending || updateMutation.isPending} variant="primary" style={{ marginBottom: '1px' }}>
                {editingFieldId ? <Edit2 size={16} /> : <Plus size={16} />}
                {editingFieldId ? 'Güncelle' : 'Ekle'}
              </Button>
              {editingFieldId && (
                <Button onClick={handleCancelEdit} variant="danger" style={{ marginBottom: '1px' }}>
                  <X size={16} /> İptal
                </Button>
              )}
            </div>
          </div>
          {newField.type === 'ENUM' && (
            <div className="w-full animate-[fadeIn_0.2s_ease-out_forwards]">
              <Input 
                label="Kabul Edilen Değerler (Virgülle ayırarak girin)" 
                placeholder="Örn: VIP, STANDARD, PREMIUM" 
                value={newField.allowedValuesStr} 
                onChange={e => setNewField({...newField, allowedValuesStr: e.target.value})}
                fullWidth
              />
            </div>
          )}
        </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-text-secondary m-0">Örnek bir JSON verisi yapıştırın. Sistem anahtarları alan adı olarak alacak ve tiplerini (Sayı, Metin, Mantıksal) otomatik tanıyıp havuza ekleyecektir.</p>
            <textarea 
              className="w-full h-[150px] bg-space-900 border border-border-subtle text-text-primary font-mono text-sm p-3 rounded-md resize-none outline-none focus:border-neon-blue"
              value={bulkJson}
              onChange={e => setBulkJson(e.target.value)}
              spellCheck={false}
            />
            <Button onClick={handleBulkAdd} isLoading={createMutation.isPending} variant="primary" className="w-full">
              <Plus size={16} /> JSON'dan Alanları Çıkar ve Ekle
            </Button>
          </div>
        )}

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
                  <span className="text-xs text-text-muted font-mono">
                    {f.type}{f.required ? ' • Zorunlu' : ''}
                    {f.type === 'ENUM' && f.allowedValues && f.allowedValues.length > 0 && (
                      <span className="text-neon-blue"> [ {f.allowedValues.join(', ')} ]</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button 
                    className="text-text-muted hover:text-neon-blue p-2 rounded hover:bg-neon-blue/10 transition-all"
                    onClick={() => handleEditClick(f)}
                    title="Düzenle"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    className="text-text-muted hover:text-red-400 p-2 rounded hover:bg-red-500/10 transition-all"
                    onClick={() => handleDeleteField(f.id)}
                    disabled={deleteMutation.isPending}
                    title="Sil"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
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
