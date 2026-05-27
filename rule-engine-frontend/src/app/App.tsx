import { useState } from 'react';
import { NodePalette } from '../features/RuleEditor/components/NodePalette/NodePalette';
import { RuleCanvas } from '../features/RuleEditor/components/RuleCanvas/RuleCanvas';
import { RuleListPanel } from '../features/RuleList/components/RuleListPanel/RuleListPanel';
import { Dashboard } from '../features/Dashboard/components/Dashboard';
import { ThemeToggle } from '../shared/components';
import { LayoutDashboard, Network } from 'lucide-react';

export default function App() {
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'dashboard'>('editor');

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-space-900 text-text-primary">
      <header className="px-8 py-4 bg-surface-secondary border-b border-border-subtle flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-8">
          <div>
            <h1 className="m-0 text-2xl font-semibold text-text-primary drop-shadow-[0_0_10px_rgba(14,165,233,0.3)]">Rule Engine</h1>
          </div>
          
          <nav className="flex items-center gap-2 bg-space-900 p-1 rounded-lg border border-border-subtle">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'editor' ? 'bg-neon-blue/20 text-neon-blue shadow-[0_0_10px_rgba(14,165,233,0.1)]' : 'text-text-secondary hover:text-text-primary hover:bg-space-800'
              }`}
            >
              <Network size={16} /> Editör
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'dashboard' ? 'bg-neon-blue/20 text-neon-blue shadow-[0_0_10px_rgba(14,165,233,0.1)]' : 'text-text-secondary hover:text-text-primary hover:bg-space-800'
              }`}
            >
              <LayoutDashboard size={16} /> Dashboard
            </button>
          </nav>
        </div>
        <ThemeToggle />
      </header>
      
      {activeTab === 'editor' ? (
        <main className="flex flex-col lg:flex-row h-[calc(100vh-73px)] overflow-y-auto lg:overflow-hidden relative">
          <NodePalette />
          <RuleCanvas selectedRuleId={selectedRuleId} setSelectedRuleId={setSelectedRuleId} />
          <RuleListPanel selectedRuleId={selectedRuleId} setSelectedRuleId={setSelectedRuleId} />
        </main>
      ) : (
        <main className="flex flex-col h-[calc(100vh-73px)] overflow-hidden relative">
          <Dashboard />
        </main>
      )}
    </div>
  );
}
