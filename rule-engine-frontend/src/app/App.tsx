import { NodePalette } from '../features/RuleEditor/components/NodePalette/NodePalette';
import { RuleCanvas } from '../features/RuleEditor/components/RuleCanvas/RuleCanvas';
import { RuleListPanel } from '../features/RuleList/components/RuleListPanel/RuleListPanel';
import './App.css';

export default function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Rule Engine</h1>
        <p className="app-subtitle">Feature-Driven Architecture</p>
      </header>
      <main className="app-main">
        <NodePalette />
        <RuleCanvas />
        <RuleListPanel />
      </main>
    </div>
  );
}
