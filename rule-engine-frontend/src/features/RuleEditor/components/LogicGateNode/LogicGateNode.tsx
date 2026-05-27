import React from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { GitMerge, Copy, Trash2 } from 'lucide-react';
import { LogicGateFlowNode, LogicGateType } from '../../types/ruleNode.types';
import { useRuleEngineContext } from '../../contexts/RuleEngineContext';

export function LogicGateNode({ id, data, selected }: NodeProps<LogicGateFlowNode>) {
  const { setNodes } = useReactFlow();
  const { takeSnapshot } = useRuleEngineContext();

  const updateData = (newData: Partial<LogicGateFlowNode['data']>) => {
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
        position: { x: nodes.find((n) => n.id === id)!.position.x + 200, y: nodes.find((n) => n.id === id)!.position.y },
      },
    ]);
  };

  return (
    <div className={`w-[240px] bg-surface-elevated rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.15)] border border-border-subtle flex flex-col overflow-hidden ${selected ? 'border-neon-purple shadow-[0_0_20px_rgba(168,85,247,0.3)]' : ''}`}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-neon-purple border-2 border-surface-elevated" />
      
      <div className="bg-neon-purple/10 border-b border-neon-purple/20 p-3 flex items-center gap-2">
        <GitMerge size={16} className="text-neon-purple" />
        <span className="font-semibold text-sm text-text-primary uppercase tracking-wider flex-1">Mantık</span>
        <button onClick={onClone} className="text-text-muted hover:text-text-primary p-1 rounded hover:bg-surface-secondary" title="Kopyala"><Copy size={14} /></button>
        <button onClick={onDelete} className="text-text-muted hover:text-red-400 p-1 rounded hover:bg-red-500/10" title="Sil"><Trash2 size={14} /></button>
      </div>

      <div className="p-4 flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <select 
            className="w-full bg-space-900 border border-border-subtle rounded text-text-primary font-bold text-center p-2 outline-none focus:border-neon-purple"
            value={data.gateType as string}
            onChange={(e) => updateData({ gateType: e.target.value as LogicGateType })}
          >
            <option value={LogicGateType.AND}>AND (VE)</option>
            <option value={LogicGateType.OR}>OR (VEYA)</option>
          </select>
        </div>
      </div>
      
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-neon-purple border-2 border-surface-elevated" />
    </div>
  );
}
