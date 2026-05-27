import React from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { GitMerge, Copy, Trash2 } from 'lucide-react';
import { LogicGateFlowNode, LogicGateType } from '../../types/ruleNode.types';
import { useRuleEngineContext } from '../../contexts/RuleEngineContext';
import { SelectBox } from '../../../../shared/components';

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
    <div className={`w-[240px] bg-surface-elevated rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.15)] border border-border-subtle flex flex-col overflow-hidden transition-all duration-300 ${selected ? 'border-neon-purple shadow-[0_0_25px_rgba(168,85,247,0.4)] -translate-y-1' : ''}`}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-neon-purple border-2 border-surface-elevated transition-transform hover:scale-150" />
      
      <div className="bg-gradient-to-r from-neon-purple/20 to-transparent border-b border-neon-purple/20 p-3 flex items-center gap-2">
        <GitMerge size={16} className="text-neon-purple" />
        <span className="font-semibold text-sm text-text-primary uppercase tracking-wider flex-1">Mantık</span>
        <button onClick={onClone} className="text-text-muted hover:text-text-primary p-1 rounded hover:bg-surface-secondary transition-colors" title="Kopyala"><Copy size={14} /></button>
        <button onClick={onDelete} className="text-text-muted hover:text-red-400 p-1 rounded hover:bg-red-500/10 transition-colors" title="Sil"><Trash2 size={14} /></button>
      </div>

      <div className="p-4 flex flex-col gap-4">
        <SelectBox
          value={data.gateType as string}
          onChange={(e) => updateData({ gateType: e.target.value as LogicGateType })}
          options={[
            { value: LogicGateType.AND, label: 'AND (VE)' },
            { value: LogicGateType.OR, label: 'OR (VEYA)' },
          ]}
          className="font-bold text-center"
        />
      </div>
      
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-neon-purple border-2 border-surface-elevated transition-transform hover:scale-150" />
    </div>
  );
}
