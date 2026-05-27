import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { Database, Copy, Trash2 } from 'lucide-react';
import { ActionFlowNode } from '../../types/ruleNode.types';
import { useRuleEngineContext } from '../../contexts/RuleEngineContext';
import { Input, SelectBox } from '../../../../shared/components';

export function ActionNode({ id, data, selected }: NodeProps<ActionFlowNode>) {
  const { setNodes } = useReactFlow();
  const { takeSnapshot } = useRuleEngineContext();

  const updateData = (payload: any) => {
    takeSnapshot();
    if (data.onChange) {
      data.onChange(id, { ...data, ...payload });
    }
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
    <div className={`w-[280px] bg-surface-elevated rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.15)] border border-border-subtle flex flex-col overflow-hidden transition-all duration-300 ${selected ? 'border-red-400 shadow-[0_0_25px_rgba(239,68,68,0.4)] -translate-y-1' : ''}`}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-red-400 border-2 border-surface-elevated transition-transform hover:scale-150" />
      
      <div className="bg-gradient-to-r from-red-500/20 to-transparent border-b border-red-500/20 p-3 flex items-center gap-2">
        <Database size={16} className="text-red-400" />
        <span className="font-semibold text-sm text-text-primary uppercase tracking-wider flex-1">Aksiyon</span>
        <button onClick={onClone} className="text-text-muted hover:text-text-primary p-1 rounded hover:bg-surface-secondary transition-colors" title="Kopyala"><Copy size={14} /></button>
        <button onClick={onDelete} className="text-text-muted hover:text-red-400 p-1 rounded hover:bg-red-500/10 transition-colors" title="Sil"><Trash2 size={14} /></button>
      </div>

      <div className="p-4 flex flex-col gap-4">
        <SelectBox
          label="Aksiyon Tipi"
          value={data.actionType as string || ''}
          onChange={(e) => updateData({ actionType: e.target.value })}
          options={[
            { value: '', label: 'Seçiniz...' },
            { value: 'ALLOW', label: 'İzin Ver (ALLOW)' },
            { value: 'DENY', label: 'Reddet (DENY)' },
            { value: 'LOG', label: 'Kayıt Al (LOG)' },
            { value: 'NOTIFY', label: 'Bildirim Gönder' },
            { value: 'CUSTOM', label: 'Özel Aksiyon' },
          ]}
          error={!data.actionType ? 'Zorunlu' : undefined}
        />

        {data.actionType === 'CUSTOM' && (
          <div className="mt-2">
            <Input
              label="Özel Aksiyon Detayı"
              value={data.params?.customActionPayload || ''}
              onChange={(e) => updateData({ params: { ...(data.params || {}), customActionPayload: e.target.value } })}
              placeholder="Örn: webhookTetikle, bakiyeDus..."
              error={!data.params?.customActionPayload ? 'Zorunlu' : undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
}
