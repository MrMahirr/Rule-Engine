import React, { useRef, useState } from 'react';
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
import { useRuleValidation } from '../../hooks/useRuleValidation';
import { useSaveRuleMutation } from '../../services/useRuleQueries';
import { Button, Modal, Input } from '../../../../shared/components';
import './RuleCanvas.css';

const nodeTypes = {
  condition: ConditionNode,
  logic_gate: LogicGateNode,
  action: ActionNode,
};

function RuleCanvasInternal() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, setNodes, updateNodeData, toAST } = useRuleEngine();
  const { onDragOver, onDrop } = useNodeDragAndDrop(setNodes, updateNodeData);
  const { validateRule } = useRuleValidation();
  const saveMutation = useSaveRuleMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [ruleDesc, setRuleDesc] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleSaveClick = () => {
    const { isValid, errors } = validateRule(nodes, edges);
    if (!isValid) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);
    setIsModalOpen(true);
  };

  const submitSave = async () => {
    const { ast, action } = toAST();
    try {
      await saveMutation.mutateAsync({
        name: ruleName || 'İsimsiz Kural',
        description: ruleDesc,
        ast,
        action
      });
      setIsModalOpen(false);
      setRuleName('');
      setRuleDesc('');
    } catch (error) {
      console.error('Save failed', error);
      // handled by global interceptor ideally, or show local error
    }
  };

  return (
    <div className="rule-canvas-wrapper" ref={reactFlowWrapper}>
      <div className="canvas-toolbar">
        <Button onClick={handleSaveClick} variant="primary">Kuralı Kaydet</Button>
      </div>

      {validationErrors.length > 0 && (
        <div className="validation-errors">
          {validationErrors.map((err, i) => <div key={i}>{err}</div>)}
        </div>
      )}

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

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Kuralı Kaydet"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>İptal</Button>
            <Button variant="primary" onClick={submitSave} isLoading={saveMutation.isPending}>Kaydet</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input 
            label="Kural Adı" 
            placeholder="Örn: Yaş ve Rol Kontrolü" 
            value={ruleName} 
            onChange={e => setRuleName(e.target.value)} 
            fullWidth
          />
          <Input 
            label="Açıklama" 
            placeholder="Bu kural ne işe yarar?" 
            value={ruleDesc} 
            onChange={e => setRuleDesc(e.target.value)} 
            fullWidth
          />
        </div>
      </Modal>
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
