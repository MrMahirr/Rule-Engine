import { RuleNodeType } from '../../types/ruleNode.types';
import { Database, Filter, GitMerge } from 'lucide-react';

export function NodePalette() {
  const onDragStart = (event: React.DragEvent, nodeType: RuleNodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-full lg:w-64 bg-surface-elevated border-b lg:border-b-0 lg:border-r border-border-subtle p-3 lg:p-5 flex flex-row lg:flex-col gap-3 lg:gap-4 overflow-x-auto lg:overflow-y-auto shrink-0 z-10">
      <h3 className="hidden lg:block m-0 mb-2 text-sm font-semibold uppercase tracking-wider text-text-muted border-b border-border-subtle pb-2">Düğümler</h3>
      
      <div 
        className="flex shrink-0 items-center gap-2 lg:gap-3 p-2 lg:p-3 bg-surface-secondary border border-border-subtle rounded-lg cursor-grab hover:-translate-y-0.5 hover:shadow-[0_0_10px_rgba(14,165,233,0.2)] transition-all duration-300" 
        onDragStart={(event) => onDragStart(event, RuleNodeType.CONDITION)} 
        draggable
      >
        <Filter className="text-neon-blue" size={20} />
        <span className="font-medium text-text-primary text-sm">Koşul Ekle</span>
      </div>

      <div 
        className="flex shrink-0 items-center gap-2 lg:gap-3 p-2 lg:p-3 bg-surface-secondary border border-border-subtle rounded-lg cursor-grab hover:-translate-y-0.5 hover:shadow-[0_0_10px_rgba(168,85,247,0.2)] transition-all duration-300" 
        onDragStart={(event) => onDragStart(event, RuleNodeType.LOGIC_GATE)} 
        draggable
      >
        <GitMerge className="text-neon-purple" size={20} />
        <span className="font-medium text-text-primary text-sm">Mantık (AND/OR)</span>
      </div>

      <div 
        className="flex shrink-0 items-center gap-2 lg:gap-3 p-2 lg:p-3 bg-surface-secondary border border-border-subtle rounded-lg cursor-grab hover:-translate-y-0.5 hover:shadow-[0_0_10px_rgba(239,68,68,0.2)] transition-all duration-300" 
        onDragStart={(event) => onDragStart(event, RuleNodeType.ACTION)} 
        draggable
      >
        <Database className="text-red-400" size={20} />
        <span className="font-medium text-text-primary text-sm">Aksiyon (Sonuç)</span>
      </div>
      <div className="hidden lg:block text-xs text-text-muted mt-2 text-center">
        Sürükleyip çalışma alanına bırakın.
      </div>
    </aside>
  );
}
