import React, { useState } from 'react';
import { Button } from '../../../../shared/components';
import { ASTNode, ASTActionNode } from '../../types/ast.types';
import { evaluateAST } from '../../utils/ruleEvaluator';
import './RuleSimulator.css';

interface RuleSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  ast: ASTNode | null;
  actions: ASTActionNode[];
}

export function RuleSimulator({ isOpen, onClose, ast, actions }: RuleSimulatorProps) {
  const [jsonInput, setJsonInput] = useState<string>('{\n  "age": 25,\n  "status": "active"\n}');
  const [result, setResult] = useState<{ matched: boolean; error?: string } | null>(null);

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
    <div className="rule-simulator-panel">
      <div className="simulator-header">
        <h3>Kural Simülasörü</h3>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>
      
      <div className="simulator-content">
        <p className="simulator-desc">Test verisini JSON formatında girin.</p>
        
        <textarea 
          className="json-editor"
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          spellCheck={false}
        />

        <Button variant="primary" onClick={handleTest} style={{ width: '100%', marginTop: '1rem' }}>Test Et</Button>

        {result && (
          <div className={`simulator-result ${result.error ? 'error' : result.matched ? 'success' : 'failed'}`}>
            {result.error ? (
              <div>{result.error}</div>
            ) : (
              <>
                <div className="result-status">
                  {result.matched ? 'EŞLEŞTİ (BAŞARILI)' : 'EŞLEŞMEDİ (BAŞARISIZ)'}
                </div>
                {result.matched && actions && actions.length > 0 && (
                  <div className="result-action">
                    <strong>Tetiklenen Aksiyonlar:</strong>
                    <ul style={{ margin: '0.5rem 0', paddingLeft: '1.2rem', textAlign: 'left' }}>
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
    </div>
  );
}
