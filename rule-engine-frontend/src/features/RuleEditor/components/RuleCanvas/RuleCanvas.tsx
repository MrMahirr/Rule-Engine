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
import { useRuleImportExport } from '../../hooks/useRuleImportExport';
import { useAutoLayout } from '../../hooks/useAutoLayout';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useSaveRuleMutation } from '../../services/useRuleQueries';
import { Button, Modal, Input, useToast } from '../../../../shared/components';
import { FieldManagementModal } from '../FieldManagementModal/FieldManagementModal';
import { RuleSimulator } from '../RuleSimulator/RuleSimulator';
import './RuleCanvas.css';

const nodeTypes = {
  condition: ConditionNode,
  logic_gate: LogicGateNode,
  action: ActionNode,
};

function RuleCanvasInternal() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, setNodes, setEdges, updateNodeData, toAST, takeSnapshot, undo, redo, canUndo, canRedo } = useRuleEngine();
  const { onDragOver, onDrop } = useNodeDragAndDrop(setNodes, updateNodeData, takeSnapshot);
  const { validateRule } = useRuleValidation();
  const saveMutation = useSaveRuleMutation();
  const { success, error } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [ruleDesc, setRuleDesc] = useState('');
  const [ruleCategory, setRuleCategory] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { exportRule, importRule } = useRuleImportExport(setNodes, setEdges, setRuleName, setRuleDesc);
  const { autoLayout } = useAutoLayout(nodes, edges, setNodes, takeSnapshot);

  const handleExportClick = () => {
    const { ast, actions } = toAST();
    exportRule({ ruleName, ruleDesc, nodes, edges, ast, actions });
  };

  const handleImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importRule(file);
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveClick = () => {
    const { isValid, errors } = validateRule(nodes, edges);
    if (!isValid) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);
    setIsModalOpen(true);
  };

  useKeyboardShortcuts({
    onSave: handleSaveClick,
    onUndo: undo,
    onRedo: redo
  });

  const submitSave = async () => {
    const { ast, actions } = toAST();
    try {
      await saveMutation.mutateAsync({
        name: ruleName || 'İsimsiz Kural',
        description: ruleDesc,
        category: ruleCategory || 'Genel',
        isActive: true,
        ast,
        actions
      });
      setIsModalOpen(false);
      setRuleName('');
      setRuleDesc('');
      setRuleCategory('');
      success('Kural Kaydedildi', 'Kural başarıyla veritabanına kaydedildi.');
    } catch (err) {
      console.error('Save failed', err);
      error('Kayıt Başarısız', 'Kural kaydedilirken bir sorun oluştu.');
    }
  };

  return (
    <div className="rule-canvas-wrapper" ref={reactFlowWrapper}>
      <div className="canvas-toolbar">
        <Button onClick={autoLayout} variant="secondary" style={{ marginRight: '0.5rem' }}>Düzenle (Auto-Layout)</Button>
        <Button onClick={() => setIsSimulatorOpen(true)} variant="secondary" style={{ marginRight: '0.5rem' }}>Simülasyon</Button>
        <Button onClick={() => setIsFieldModalOpen(true)} variant="secondary">Alanları Yönet</Button>
        <div style={{ flex: 1 }}></div>
        <div style={{ display: 'flex', gap: '0.5rem', marginRight: '1rem', borderRight: '1px solid var(--color-border-subtle)', paddingRight: '1rem' }}>
          <Button onClick={undo} variant="ghost" disabled={!canUndo} title="Geri Al (Ctrl+Z)">Geri Al</Button>
          <Button onClick={redo} variant="ghost" disabled={!canRedo} title="Yinele (Ctrl+Y)">Yinele</Button>
        </div>
        <input 
          type="file" 
          accept=".json" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleImportChange} 
        />
        <Button onClick={() => fileInputRef.current?.click()} variant="secondary">İçe Aktar</Button>
        <Button onClick={handleExportClick} variant="secondary">Dışa Aktar</Button>
        <Button onClick={handleSaveClick} variant="primary">Kuralı Kaydet</Button>
      </div>

      {validationErrors.length > 0 && (
        <div className="validation-errors">
          {validationErrors.map((err, i) => <div key={i}>{err}</div>)}
        </div>
      )}

      <RuleSimulator 
        isOpen={isSimulatorOpen} 
        onClose={() => setIsSimulatorOpen(false)} 
        ast={toAST().ast}
        actions={toAST().actions}
      />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onDragOver={onDragOver}
        onDrop={onDrop}
        deleteKeyCode={['Backspace', 'Delete']}
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
            value={ruleName} 
            onChange={(e) => setRuleName(e.target.value)} 
            placeholder="Örn: VIP Müşteri İndirimi" 
            fullWidth 
          />
          <Input 
            label="Kategori" 
            value={ruleCategory} 
            onChange={(e) => setRuleCategory(e.target.value)} 
            placeholder="Örn: Risk Kuralları, Kampanya" 
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

      <FieldManagementModal isOpen={isFieldModalOpen} onClose={() => setIsFieldModalOpen(false)} />
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
