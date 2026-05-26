import React, { useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  ReactFlowProvider,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { ConditionNode } from '../ConditionNode/ConditionNode';
import { LogicGateNode } from '../LogicGateNode/LogicGateNode';
import { ActionNode } from '../ActionNode/ActionNode';
import { useRuleEngine } from '../../hooks/useRuleEngine';
import { useNodeDragAndDrop } from '../../hooks/useNodeDragAndDrop';
import './RuleCanvas.css';

const nodeTypes = {
  condition: ConditionNode,
  logic_gate: LogicGateNode,
  action: ActionNode,
};

function RuleCanvasInternal() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  // Custom Hook for State & Business Logic
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect, 
    setNodes, 
    updateNodeData 
  } = useRuleEngine();

  // Custom Hook for Drag & Drop
  const { onDragOver, onDrop } = useNodeDragAndDrop(setNodes, updateNodeData);

  return (
    <div className="rule-canvas-wrapper" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="rgba(255, 255, 255, 0.1)" />
        <Controls className="rule-canvas-controls" />
        <MiniMap 
          nodeColor={(node) => {
            switch (node.type) {
              case 'condition': return '#00d4ff';
              case 'logic_gate': return '#a855f7';
              case 'action': return '#22d3ee';
              default: return '#eee';
            }
          }}
          maskColor="rgba(6, 6, 15, 0.7)"
          style={{ backgroundColor: '#161633' }}
        />
      </ReactFlow>
    </div>
  );
}

export function RuleCanvas() {
  return (
    <ReactFlowProvider>
      <RuleCanvasInternal />
    </ReactFlowProvider>
  );
}
