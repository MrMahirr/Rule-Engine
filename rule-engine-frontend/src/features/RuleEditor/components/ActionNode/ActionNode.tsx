import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { ActionFlowNode, ActionNodeData } from '../../types/ruleNode.types';
import { SelectBox } from '../../../../shared/components';
import './ActionNode.css';

export function ActionNode({ id, data, selected }: NodeProps<ActionFlowNode>) {
  const handleActionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (data.onChange) {
      data.onChange(id, { actionType: e.target.value as ActionNodeData['actionType'] });
    }
  };

  const actions = [
    { value: 'ALLOW', label: 'İzin Ver (ALLOW)' },
    { value: 'DENY', label: 'Reddet (DENY)' },
    { value: 'LOG', label: 'Kayıt Al (LOG)' },
    { value: 'NOTIFY', label: 'Bildirim Gönder' },
    { value: 'CUSTOM', label: 'Özel Aksiyon' },
  ];

  return (
    <div className={`node-action ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Top} className="handle-input" />
      
      <div className="node-header">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 13l4 4L19 7"></path>
        </svg>
        <span>Aksiyon (Action)</span>
      </div>

      <div className="node-body">
        <SelectBox 
          options={actions}
          value={data.actionType || 'ALLOW'}
          onChange={handleActionChange}
          fullWidth
          className="nodrag"
        />
      </div>
    </div>
  );
}
