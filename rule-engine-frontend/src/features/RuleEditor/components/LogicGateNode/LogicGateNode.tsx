import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { LogicGateFlowNode, LogicGateType } from '../../types/ruleNode.types';
import './LogicGateNode.css';

export function LogicGateNode({ id, data, selected }: NodeProps<LogicGateFlowNode>) {
  const toggleGate = () => {
    if (data.onChange) {
      const newGate = data.gateType === LogicGateType.AND ? LogicGateType.OR : LogicGateType.AND;
      data.onChange(id, { gateType: newGate });
    }
  };

  return (
    <div className={`node-logic ${data.gateType.toLowerCase()} ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Top} className="handle-input" />
      
      <button className="logic-toggle-btn nodrag" onClick={toggleGate}>
        {data.gateType}
      </button>

      <Handle type="source" position={Position.Bottom} className="handle-output" />
    </div>
  );
}
