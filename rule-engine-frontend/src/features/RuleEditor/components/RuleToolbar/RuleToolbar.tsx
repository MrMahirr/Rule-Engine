import React, { RefObject } from 'react';
import { LayoutDashboard, Play, Settings, Undo as UndoIcon, Redo as RedoIcon, Download, Upload, Save, FilePlus, History } from 'lucide-react';
import { Button } from '../../../../shared/components';

interface RuleToolbarProps {
  autoLayout: () => void;
  setIsSimulatorOpen: (open: boolean) => void;
  selectedRuleId: string | null;
  setIsHistoryModalOpen: (open: boolean) => void;
  setIsFieldModalOpen: (open: boolean) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  fileInputRef: RefObject<HTMLInputElement>;
  handleImportChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleNewRule: () => void;
  handleExportClick: () => void;
  handleSaveClick: () => void;
}

export function RuleToolbar({
  autoLayout,
  setIsSimulatorOpen,
  selectedRuleId,
  setIsHistoryModalOpen,
  setIsFieldModalOpen,
  undo,
  redo,
  canUndo,
  canRedo,
  fileInputRef,
  handleImportChange,
  handleNewRule,
  handleExportClick,
  handleSaveClick
}: RuleToolbarProps) {
  return (
    <div className="absolute top-4 right-4 z-10 flex flex-wrap gap-2 w-[calc(100%-2rem)] justify-end">
      <Button onClick={autoLayout} variant="secondary" size="sm"><LayoutDashboard size={12} /> Düzenle</Button>
      <Button onClick={() => setIsSimulatorOpen(true)} variant="secondary" size="sm"><Play size={12} /> Simülasyon</Button>
      {selectedRuleId && (
        <Button onClick={() => setIsHistoryModalOpen(true)} variant="secondary" size="sm" className="!bg-neon-blue/10 !text-neon-blue !border-neon-blue/30 hover:!bg-neon-blue/20">
          <History size={12} /> Geçmiş
        </Button>
      )}
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
      <Button onClick={handleNewRule} variant="secondary" size="sm"><FilePlus size={12} /> Yeni Kural</Button>
      <Button onClick={() => fileInputRef.current?.click()} variant="secondary" size="sm"><Upload size={12} /> İçe Aktar</Button>
      <Button onClick={handleExportClick} variant="secondary" size="sm"><Download size={12} /> Dışa Aktar</Button>
      <Button onClick={handleSaveClick} variant="primary" size="sm"><Save size={12} /> {selectedRuleId ? 'Kuralı Güncelle' : 'Kuralı Kaydet'}</Button>
    </div>
  );
}
