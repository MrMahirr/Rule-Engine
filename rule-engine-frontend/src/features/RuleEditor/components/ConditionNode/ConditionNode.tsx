import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { ConditionNodeData, ConditionOperator } from '../../types/ruleNode.types';
import { Input, SelectBox } from '../../../../shared/components';
import './ConditionNode.css';

export function ConditionNode({ id, data, selected }: NodeProps<ConditionNodeData>) {
  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (data.onChange) {
      data.onChange(id, { field: e.target.value });
    }
  };

  const handleOperatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (data.onChange) {
      data.onChange(id, { operator: e.target.value as ConditionOperator });
    }
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (data.onChange) {
      data.onChange(id, { value: e.target.value });
    }
  };

  const operators = [
    { value: ConditionOperator.EQUALS, label: 'Eşittir (==)' },
    { value: ConditionOperator.NOT_EQUALS, label: 'Eşit Değildir (!=)' },
    { value: ConditionOperator.GREATER_THAN, label: 'Büyüktür (>)' },
    { value: ConditionOperator.LESS_THAN, label: 'Küçüktür (<)' },
    { value: ConditionOperator.GREATER_EQUAL, label: 'Büyük Eşit (>=)' },
    { value: ConditionOperator.LESS_EQUAL, label: 'Küçük Eşit (<=)' },
    { value: ConditionOperator.CONTAINS, label: 'İçerir' },
    { value: ConditionOperator.NOT_CONTAINS, label: 'İçermez' },
  ];

  return (
    <div className={`node-condition ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Top} className="handle-input" />
      
      <div className="node-header">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
        </svg>
        <span>Koşul (Condition)</span>
      </div>

      <div className="node-body">
        <Input 
          placeholder="Alan (örn: age)" 
          value={data.field || ''} 
          onChange={handleFieldChange}
          fullWidth
          className="nodrag"
        />
        <SelectBox 
          options={operators}
          value={data.operator || ConditionOperator.EQUALS}
          onChange={handleOperatorChange}
          fullWidth
          className="nodrag"
        />
        <Input 
          placeholder="Değer (örn: 18)" 
          value={data.value || ''} 
          onChange={handleValueChange}
          fullWidth
          className="nodrag"
        />
      </div>

      <Handle type="source" position={Position.Bottom} className="handle-output" />
    </div>
  );
}
