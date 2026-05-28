import React from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { Filter, Copy, Trash2 } from 'lucide-react';
import { ConditionFlowNode, ConditionOperator } from '../../types/ruleNode.types';
import { useFieldsQuery } from '../../services/useFieldQueries';
import { useRuleEngineContext } from '../../contexts/RuleEngineContext';
import { Input, SelectBox } from '../../../../shared/components';

export function ConditionNode({ id, data, selected }: NodeProps<ConditionFlowNode>) {
  const { setNodes } = useReactFlow();
  const { data: fieldsData } = useFieldsQuery();
  const fields = fieldsData?.data || [];
  const { takeSnapshot } = useRuleEngineContext();
  
  const selectedField = fields.find(f => f.name === data.field);

  const updateData = (newData: Partial<ConditionFlowNode['data']>) => {
    takeSnapshot();
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...newData } } : node
      )
    );
  };

  const onDelete = () => {
    takeSnapshot();
    setNodes((nodes) => nodes.filter((n) => n.id !== id));
  };
  
  const onClone = () => {
    takeSnapshot();
    setNodes((nodes) => [
      ...nodes,
      {
        ...nodes.find((n) => n.id === id)!,
        id: `${id}-clone`,
        position: { x: nodes.find((n) => n.id === id)!.position.x + 300, y: nodes.find((n) => n.id === id)!.position.y },
      },
    ]);
  };

  return (
    <div className={`w-[280px] bg-surface-elevated rounded-xl shadow-[0_0_15px_rgba(14,165,233,0.15)] border border-border-subtle flex flex-col overflow-hidden transition-all duration-300 ${selected ? 'border-neon-blue shadow-[0_0_25px_rgba(14,165,233,0.4)] -translate-y-1' : ''}`}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-neon-blue border-2 border-surface-elevated transition-transform hover:scale-150" />
      
      <div className="bg-gradient-to-r from-neon-blue/20 to-transparent border-b border-neon-blue/20 p-3 flex items-center gap-2">
        <Filter size={16} className="text-neon-blue" />
        <span className="font-semibold text-sm text-text-primary uppercase tracking-wider flex-1">Koşul</span>
        <button onClick={onClone} className="text-text-muted hover:text-text-primary p-1 rounded hover:bg-surface-secondary transition-colors" title="Kopyala"><Copy size={14} /></button>
        <button onClick={onDelete} className="text-text-muted hover:text-red-400 p-1 rounded hover:bg-red-500/10 transition-colors" title="Sil"><Trash2 size={14} /></button>
      </div>

      <div className="p-4 flex flex-col gap-4">
        <SelectBox
          label="Alan (Field)"
          value={data.field as string || ''}
          onChange={(e) => updateData({ field: e.target.value })}
          options={[
            { value: '', label: 'Alan Seçin' },
            ...fields.map(f => ({ value: f.name, label: f.name }))
          ]}
          error={!data.field ? 'Zorunlu' : undefined}
        />

        <SelectBox
          label="Operatör"
          value={data.operator as string || ''}
          onChange={(e) => updateData({ operator: e.target.value as ConditionOperator })}
          disabled={!data.field}
          options={[
            { value: '', label: 'Operatör Seçin' },
            ...Object.values(ConditionOperator).map(op => ({ value: op, label: op.toUpperCase() }))
          ]}
          error={data.field && !data.operator ? 'Zorunlu' : undefined}
        />

        {(() => {
          const isMultiple = data.operator === ConditionOperator.IN || data.operator === ConditionOperator.NOT_IN;

          if (selectedField?.type === 'ENUM' && !isMultiple) {
            return (
              <SelectBox
                label="Değer"
                value={data.value as string || ''}
                onChange={(e) => updateData({ value: e.target.value })}
                disabled={!data.operator}
                options={[
                  { value: '', label: 'Değer Seçin' },
                  ...(selectedField.allowedValues || []).map(val => ({ value: val, label: val }))
                ]}
                error={data.operator && !data.value ? 'Zorunlu' : undefined}
              />
            );
          }

          if (selectedField?.type === 'BOOLEAN' && !isMultiple) {
            return (
              <SelectBox
                label="Değer"
                value={data.value as string || ''}
                onChange={(e) => updateData({ value: e.target.value })}
                disabled={!data.operator}
                options={[
                  { value: '', label: 'Seçiniz...' },
                  { value: 'true', label: 'Doğru (true)' },
                  { value: 'false', label: 'Yanlış (false)' }
                ]}
                error={data.operator && !data.value ? 'Zorunlu' : undefined}
              />
            );
          }

          if (selectedField?.type === 'DATETIME' && !isMultiple) {
            const val = (data.value as string) || '';
            const [dateStr, timeStr] = val.includes('T') ? val.split('T') : [val, ''];
            
            return (
              <div className="flex flex-col gap-1">
                <label className="input-label">Değer (Tarih ve Saat)</label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={dateStr}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      updateData({ value: newDate ? `${newDate}T${timeStr || '00:00'}` : '' });
                    }}
                    disabled={!data.operator}
                    className="flex-1"
                  />
                  <Input
                    type="time"
                    value={timeStr}
                    onChange={(e) => {
                      const newTime = e.target.value;
                      updateData({ value: dateStr ? `${dateStr}T${newTime}` : `T${newTime}` });
                    }}
                    disabled={!data.operator}
                    className="flex-1"
                  />
                </div>
                {data.operator && !data.value && <span className="text-red-400 text-xs mt-1">Zorunlu</span>}
              </div>
            );
          }

          let inputType = 'text';
          if (!isMultiple) {
            if (selectedField?.type === 'NUMBER') inputType = 'number';
            else if (selectedField?.type === 'DATE') inputType = 'date';
          }

          return (
            <Input
              label="Değer"
              type={inputType}
              value={data.value as string || ''}
              onChange={(e) => updateData({ value: e.target.value })}
              disabled={!data.operator}
              placeholder={
                isMultiple
                  ? 'Örn: A,B,C'
                  : data.operator === ConditionOperator.MATCHES
                  ? 'Örn: ^[A-Z]+$'
                  : 'Değer girin'
              }
              error={data.operator && !data.value ? 'Zorunlu' : undefined}
            />
          );
        })()}
      </div>
      
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-neon-blue border-2 border-surface-elevated transition-transform hover:scale-150" />
    </div>
  );
}
