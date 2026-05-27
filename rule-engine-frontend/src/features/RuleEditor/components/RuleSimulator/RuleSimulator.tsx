import React, { useState } from 'react';
import { ASTNode, ASTActionNode } from '../../types/ast.types';
import { evaluateAST } from '../../utils/ruleEvaluator';
import { useConflictDetection } from '../../hooks/useConflictDetection';
import { Play } from 'lucide-react';
import { Button } from '../../../../shared/components';

interface RuleSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  ast: ASTNode | null;
  actions: ASTActionNode[];
}

export function RuleSimulator({ isOpen, onClose, ast, actions }: RuleSimulatorProps) {
  const [jsonInput, setJsonInput] = useState<string>('{\n  "age": 25,\n  "status": "active"\n}');
  const [result, setResult] = useState<{ matched: boolean; error?: string } | null>(null);

  const conflicts = useConflictDetection(ast, actions);

  const handleTest = () => {
    try {
      const parsedData = JSON.parse(jsonInput);
      
      if (!ast) {
        setResult({ matched: false, error: 'Ağaç (AST) boş. Lütfen önce geçerli bir kural çizin.' });
        return;
      }

      const isMatched = evaluateAST(ast, parsedData);
      setResult({ matched: isMatched });
    } catch (e) {
      setResult({ matched: false, error: 'Geçersiz JSON formatı.' });
    }
  };

  if (!isOpen) return null;

  return (
    <aside className={`fixed right-0 top-[73px] h-[calc(100vh-73px)] w-[90%] sm:w-[400px] max-w-full bg-surface-elevated border-l border-border-subtle shadow-2xl flex flex-col transition-transform duration-300 z-40 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-surface-secondary">
        <h2 className="text-lg font-semibold text-text-primary m-0 flex items-center gap-2"><Play size={18} className="text-neon-blue" /> Simülasyon</h2>
        <button className="text-text-secondary hover:text-text-primary" onClick={onClose}>&times;</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        <p className="text-sm text-text-secondary m-0">Test verisini JSON formatında girin.</p>
        
        {conflicts.length > 0 && (
          <div className="bg-amber-950/20 border border-amber-600/30 text-amber-500 p-3 rounded text-sm">
            <strong className="block mb-1">Dikkat!</strong>
            <ul className="list-disc pl-4 space-y-1">
              {conflicts.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </div>
        )}

        <textarea 
          className="w-full h-[250px] bg-space-900 border border-border-subtle text-text-primary font-mono text-sm p-3 rounded-md resize-none outline-none focus:border-neon-blue focus:shadow-[0_0_10px_rgba(14,165,233,0.2)]"
          value={jsonInput}
          onChange={e => setJsonInput(e.target.value)}
          spellCheck={false}
        />

        <Button onClick={handleTest} className="w-full" variant="primary">
          Test Et
        </Button>

        {result && (
          <div className={`p-4 rounded-lg border ${result.matched ? 'bg-green-500/10 border-green-500/30' : result.error ? 'bg-red-500/10 border-red-500/30' : 'bg-surface-secondary border-border-subtle'}`}>
            <h3 className="text-sm font-medium m-0 mb-2 text-text-primary">Sonuç:</h3>
            {result.error ? (
              <div className="text-red-400 text-sm whitespace-pre-wrap">{result.error}</div>
            ) : (
              <>
                <div className={`text-lg font-semibold mb-3 ${result.matched ? 'text-green-400' : 'text-text-secondary'}`}>
                  {result.matched ? '✅ Eşleşti' : '❌ Eşleşmedi'}
                </div>
                {result.matched && actions && actions.length > 0 && (
                  <div className="text-sm text-text-secondary border-t border-border-subtle pt-2">
                    <strong className="text-text-primary">Tetiklenen Aksiyonlar:</strong>
                    <ul className="list-disc pl-4 mt-1">
                      {actions.map((act, i) => (
                        <li key={i}>{act.actionType}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
