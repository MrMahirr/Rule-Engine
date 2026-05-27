import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { Database, Copy, Trash2, KeyRound } from 'lucide-react';
import { ActionFlowNode } from '../../types/ruleNode.types';
import { useRuleEngineContext } from '../../contexts/RuleEngineContext';

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
    <div className={`w-[280px] bg-surface-elevated rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.15)] border border-border-subtle flex flex-col overflow-hidden ${selected ? 'border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : ''}`}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-red-400 border-2 border-surface-elevated" />
      
      <div className="bg-red-500/10 border-b border-red-500/20 p-3 flex items-center gap-2">
        <Database size={16} className="text-red-400" />
        <span className="font-semibold text-sm text-text-primary uppercase tracking-wider flex-1">Aksiyon</span>
        <button onClick={onClone} className="text-text-muted hover:text-text-primary p-1 rounded hover:bg-surface-secondary" title="Kopyala"><Copy size={14} /></button>
        <button onClick={onDelete} className="text-text-muted hover:text-red-400 p-1 rounded hover:bg-red-500/10" title="Sil"><Trash2 size={14} /></button>
      </div>

      <div className="p-4 flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase">Aksiyon Tipi</label>
          <select 
            className="w-full bg-space-900 border border-border-subtle rounded text-text-primary text-sm p-2 outline-none focus:border-red-400"
            value={data.actionType as string || ''}
            onChange={(e) => updateData({ actionType: e.target.value })}
          >
            <option value="">Seçiniz...</option>
            <option value="ALLOW">İzin Ver (ALLOW)</option>
            <option value="DENY">Reddet (DENY)</option>
            <option value="LOG">Kayıt Al (LOG)</option>
            <option value="NOTIFY">Bildirim Gönder</option>
            <option value="CUSTOM">Özel Aksiyon</option>
          </select>
        </div>

        {data.actionType === 'CUSTOM' && (
          <div className="flex flex-col gap-1.5 mt-2">
            <label className="text-xs font-medium text-text-secondary uppercase">Özel Aksiyon Detayı</label>
            <input 
              className="w-full bg-space-900 border border-border-subtle rounded text-text-primary text-sm p-2 outline-none focus:border-red-400"
              value={data.params?.customActionPayload || ''}
              onChange={(e) => updateData({ params: { ...(data.params || {}), customActionPayload: e.target.value } })}
              placeholder="Örn: webhookTetikle, bakiyeDus..."
            />
          </div>
        )}
      </div>
    </div>
  );
}
