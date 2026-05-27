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
import { LayoutDashboard, Play, Settings, Undo as UndoIcon, Redo as RedoIcon, Download, Upload, Save } from 'lucide-react';
import { RuleEngineContext } from '../../contexts/RuleEngineContext';

const nodeTypes = {
  condition: ConditionNode,
  logic_gate: LogicGateNode,
  action: ActionNode,
};

function RuleCanvasInternal() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, setNodes, setEdges, updateNodeData, toAST, takeSnapshot, undo, redo, canUndo, canRedo, copySelection, pasteSelection } = useRuleEngine();
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
  const [rulePriority, setRulePriority] = useState<number>(1);
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
    onRedo: redo,
    onCopy: copySelection,
    onPaste: pasteSelection
  });

  const submitSave = async () => {
    const { ast, actions } = toAST();
    try {
      await saveMutation.mutateAsync({
        name: ruleName || 'İsimsiz Kural',
        description: ruleDesc,
        category: ruleCategory || 'Genel',
        priority: rulePriority,
        isActive: true,
        ast,
        actions
      });
      setIsModalOpen(false);
      setRuleName('');
      setRuleDesc('');
      setRuleCategory('');
      setRulePriority(1);
      success('Kural Kaydedildi', 'Kural başarıyla veritabanına kaydedildi.');
    } catch (err) {
      console.error('Save failed', err);
      error('Kayıt Başarısız', 'Kural kaydedilirken bir sorun oluştu.');
    }
  };

  return (
    <div className="flex-1 min-h-[500px] lg:h-full w-full shrink-0 lg:shrink relative bg-space-900" ref={reactFlowWrapper}>
      <div className="absolute top-4 right-4 z-10 flex flex-wrap gap-2 w-[calc(100%-2rem)] justify-end">
        <Button onClick={autoLayout} variant="secondary" size="sm"><LayoutDashboard size={12} /> Düzenle</Button>
        <Button onClick={() => setIsSimulatorOpen(true)} variant="secondary" size="sm"><Play size={12} /> Simülasyon</Button>
        <Button onClick={() => setIsFieldModalOpen(true)} variant="secondary" size="sm"><Settings size={12} /> Alanları Yönet</Button>
        <div className="flex-1"></div>
        <div className="flex gap-2 mr-4 border-r border-border-subtle pr-4">
          <Button onClick={undo} variant="ghost" size="sm" disabled={!canUndo} title="Geri Al (Ctrl+Z)"><UndoIcon size={12} /> Geri Al</Button>
          <Button onClick={redo} variant="ghost" size="sm" disabled={!canRedo} title="Yinele (Ctrl+Y)"><RedoIcon size={12} /> Yinele</Button>
        </div>
        <input 
          type="file" 
          accept=".json" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleImportChange} 
        />
        <Button onClick={() => fileInputRef.current?.click()} variant="secondary" size="sm"><Upload size={12} /> İçe Aktar</Button>
        <Button onClick={handleExportClick} variant="secondary" size="sm"><Download size={12} /> Dışa Aktar</Button>
        <Button onClick={handleSaveClick} variant="primary" size="sm"><Save size={12} /> Kuralı Kaydet</Button>
      </div>

      {validationErrors.length > 0 && (
        <div className="absolute top-16 right-4 z-10 bg-red-500/90 text-white p-4 rounded-lg text-sm max-w-[300px] flex flex-col gap-2 shadow-lg backdrop-blur-sm">
          {validationErrors.map((err, i) => <div key={i}>{err}</div>)}
        </div>
      )}

      <RuleSimulator 
        isOpen={isSimulatorOpen} 
        onClose={() => setIsSimulatorOpen(false)} 
        ast={toAST().ast}
        actions={toAST().actions}
      />

      <RuleEngineContext.Provider value={{ takeSnapshot }}>
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
      </RuleEngineContext.Provider>

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
            label="Öncelik Sırası (1-100)" 
            type="number"
            value={rulePriority.toString()} 
            onChange={(e) => setRulePriority(Number(e.target.value))} 
            placeholder="1" 
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
