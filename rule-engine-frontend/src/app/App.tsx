import { useState } from 'react';
import { NodePalette } from '../features/RuleEditor/components/NodePalette/NodePalette';
import { RuleCanvas } from '../features/RuleEditor/components/RuleCanvas/RuleCanvas';
import { RuleListPanel } from '../features/RuleList/components/RuleListPanel/RuleListPanel';
import { ThemeToggle } from '../shared/components';

export default function App() {
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-space-900 text-text-primary">
      <header className="px-8 py-4 bg-surface-secondary border-b border-border-subtle flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="m-0 text-2xl font-semibold text-text-primary drop-shadow-[0_0_10px_rgba(14,165,233,0.3)]">Rule Engine</h1>
          </div>
        </div>
        <ThemeToggle />
      </header>
      <main className="flex flex-col lg:flex-row h-[calc(100vh-73px)] overflow-y-auto lg:overflow-hidden relative">
        <NodePalette />
        <RuleCanvas selectedRuleId={selectedRuleId} setSelectedRuleId={setSelectedRuleId} />
        <RuleListPanel selectedRuleId={selectedRuleId} setSelectedRuleId={setSelectedRuleId} />
      </main>
    </div>
  );
}
