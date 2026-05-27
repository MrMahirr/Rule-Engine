import React from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { Filter, Copy, Trash2 } from 'lucide-react';
import { ConditionFlowNode, ConditionOperator } from '../../types/ruleNode.types';
import { useFieldsQuery } from '../../services/useFieldQueries';
import { useRuleEngineContext } from '../../contexts/RuleEngineContext';

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
    <div className={`w-[280px] bg-surface-elevated rounded-xl shadow-[0_0_15px_rgba(14,165,233,0.15)] border border-border-subtle flex flex-col overflow-hidden ${selected ? 'border-neon-blue shadow-[0_0_20px_rgba(14,165,233,0.3)]' : ''}`}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-neon-blue border-2 border-surface-elevated" />
      
      <div className="bg-neon-blue/10 border-b border-neon-blue/20 p-3 flex items-center gap-2">
        <Filter size={16} className="text-neon-blue" />
        <span className="font-semibold text-sm text-text-primary uppercase tracking-wider flex-1">Koşul</span>
        <button onClick={onClone} className="text-text-muted hover:text-text-primary p-1 rounded hover:bg-surface-secondary" title="Kopyala"><Copy size={14} /></button>
        <button onClick={onDelete} className="text-text-muted hover:text-red-400 p-1 rounded hover:bg-red-500/10" title="Sil"><Trash2 size={14} /></button>
      </div>

      <div className="p-4 flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase">Alan (Field)</label>
          <select 
            className="w-full bg-space-900 border border-border-subtle rounded text-text-primary text-sm p-2 outline-none focus:border-neon-blue"
            value={data.field as string || ''} 
            onChange={(e) => updateData({ field: e.target.value })}
          >
            <option value="">Alan Seçin</option>
            {fields.map(f => (
              <option key={f.id} value={f.name}>{f.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase">Operatör</label>
          <select 
            className="w-full bg-space-900 border border-border-subtle rounded text-text-primary text-sm p-2 outline-none focus:border-neon-blue"
            value={data.operator as string || ''}
            onChange={(e) => updateData({ operator: e.target.value as ConditionOperator })}
            disabled={!data.field}
          >
            <option value="">Operatör Seçin</option>
            {['==', '!=', '>', '<', '>=', '<=', 'CONTAINS', 'NOT_CONTAINS'].map(op => (
              <option key={op} value={op}>{op}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase">Değer</label>
          <input 
            className="w-full bg-space-900 border border-border-subtle rounded text-text-primary text-sm p-2 outline-none focus:border-neon-blue"
            type={selectedField?.type === 'number' ? 'number' : 'text'}
            value={data.value as string || ''}
            onChange={(e) => updateData({ value: e.target.value })}
            disabled={!data.operator}
            placeholder="Değer girin"
          />
        </div>
      </div>
      
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-neon-blue border-2 border-surface-elevated" />
    </div>
  );
}
