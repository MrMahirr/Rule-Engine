import React, { useState } from 'react';
import { Modal, Input, Button, SelectBox } from '../../../../shared/components';
import { useFieldsQuery, useCreateFieldMutation, useDeleteFieldMutation } from '../../services/useFieldQueries';
import './FieldManagementModal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function FieldManagementModal({ isOpen, onClose }: Props) {
  const { data: fieldsData, isLoading } = useFieldsQuery();
  const createMutation = useCreateFieldMutation();
  const deleteMutation = useDeleteFieldMutation();

  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState('string');
  const [fieldDesc, setFieldDesc] = useState('');

  const fields = fieldsData?.data || [];

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldName.trim()) return;
    try {
      await createMutation.mutateAsync({
        name: fieldName.trim(),
        type: fieldType as any,
        description: fieldDesc.trim()
      });
      setFieldName('');
      setFieldDesc('');
    } catch (error) {
      console.error('Field creation failed', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu alanı havuzdan silmek istediğinize emin misiniz?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Alan Havuzunu Yönet" width="600px">
      <div className="field-modal-content">
        <form onSubmit={handleAdd} className="field-add-form">
          <h4>Yeni Alan Ekle</h4>
          <div className="form-row">
            <Input 
              placeholder="Alan Adı (örn: age)" 
              value={fieldName} 
              onChange={e => setFieldName(e.target.value)} 
              required
              fullWidth
            />
            <SelectBox 
              options={[
                { value: 'string', label: 'Metin' },
                { value: 'number', label: 'Sayı' },
                { value: 'boolean', label: 'Mantıksal (Bool)' }
              ]}
              value={fieldType}
              onChange={e => setFieldType(e.target.value)}
            />
          </div>
          <div className="form-row">
            <Input 
              placeholder="Açıklama (opsiyonel)" 
              value={fieldDesc} 
              onChange={e => setFieldDesc(e.target.value)} 
              fullWidth
            />
            <Button type="submit" variant="primary" isLoading={createMutation.isPending}>
              Ekle
            </Button>
          </div>
        </form>

        <div className="field-list-section">
          <h4>Kayıtlı Alanlar</h4>
          {isLoading ? (
            <div className="field-loading">Yükleniyor...</div>
          ) : fields.length === 0 ? (
            <div className="field-empty">Henüz hiç alan eklenmemiş.</div>
          ) : (
            <ul className="field-list">
              {fields.map(field => (
                <li key={field.id} className="field-item">
                  <div className="field-info">
                    <span className="field-name">{field.name}</span>
                    <span className="field-type">{field.type || 'string'}</span>
                    {field.description && <span className="field-desc">- {field.description}</span>}
                  </div>
                  <button 
                    type="button" 
                    className="field-delete-btn" 
                    onClick={() => handleDelete(field.id)}
                    disabled={deleteMutation.isPending}
                  >
                    Sil
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}
