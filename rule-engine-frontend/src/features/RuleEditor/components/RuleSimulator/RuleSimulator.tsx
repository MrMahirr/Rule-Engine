import React, { useState } from 'react';
import { ASTNode, ASTActionNode } from '../../types/ast.types';
import { evaluateAST } from '../../utils/ruleEvaluator';
import { useConflictDetection } from '../../hooks/useConflictDetection';
import { Play, FileJson, UploadCloud } from 'lucide-react';
import { Button } from '../../../../shared/components';
import { useBatchEvaluateMutation, useEvaluateRuleMutation } from '../../services/useRuleQueries';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

interface RuleSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  ast: ASTNode | null;
  actions: ASTActionNode[];
  ruleId?: string;
}

const COLORS = ['#0ea5e9', '#ef4444'];

export function RuleSimulator({ isOpen, onClose, ast, actions, ruleId }: RuleSimulatorProps) {
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');
  
  // Single Test State
  const [jsonInput, setJsonInput] = useState<string>('{\n  "age": 25,\n  "status": "active"\n}');
  const [result, setResult] = useState<{ matched: boolean; error?: string } | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Batch Test State
  const [batchJsonContent, setBatchJsonContent] = useState<string>('[\n  {\n    "age": 25,\n    "status": "active",\n    "amount": 1000\n  },\n  {\n    "age": 18,\n    "status": "inactive",\n    "amount": 500\n  }\n]');
  const [batchResult, setBatchResult] = useState<any>(null);
  
  const conflicts = useConflictDetection(ast, actions);
  const batchMutation = useBatchEvaluateMutation();

  const evaluateMutation = useEvaluateRuleMutation();

  const handleSingleTest = async () => {
    setResult(null);
    setIsEvaluating(true);
    try {
      const parsedData = JSON.parse(jsonInput);
      if (!ast) {
        setResult({ matched: false, error: 'Ağaç (AST) boş. Lütfen önce geçerli bir kural çizin.' });
        return;
      }
      
      // Eğer kural kaydedilmişse, backend üzerinden test et (Böylece Audit Log oluşur)
      if (ruleId) {
        try {
          const res = await evaluateMutation.mutateAsync({ ruleId, facts: parsedData });
          setResult({ matched: res.data.matched });
          return;
        } catch (err: any) {
          const errorMsg = err?.message || 'Sunucu tarafında değerlendirme başarısız oldu.';
          setResult({ matched: false, error: errorMsg });
          return;
        }
      }

      // Kural kaydedilmemişse yerel simülatör ile test et (Log oluşmaz)
      const isMatched = evaluateAST(ast, parsedData);
      setResult({ matched: isMatched });
    } catch (e) {
      setResult({ matched: false, error: 'Geçersiz JSON formatı.' });
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleBatchTest = () => {
    setBatchResult(null);
    if (!ruleId) {
      setBatchResult({ error: 'Toplu test (Backend Performansı) yapabilmek için lütfen önce kuralı KAYDEDİN.' });
      return;
    }

    try {
      const parsedData = JSON.parse(batchJsonContent);
      if (!Array.isArray(parsedData)) {
        setBatchResult({ error: 'JSON verisi bir dizi (array) formatında olmalıdır.' });
        return;
      }
      if (parsedData.length === 0) {
        setBatchResult({ error: 'JSON içerisinde geçerli veri bulunamadı.' });
        return;
      }

      batchMutation.mutate(
        { ruleId, factsList: parsedData },
        {
          onSuccess: (res) => {
            setBatchResult({ data: res.data });
          },
          onError: () => {
            setBatchResult({ error: 'Toplu test sırasında sunucu hatası oluştu.' });
          }
        }
      );
    } catch (e) {
      setBatchResult({ error: 'JSON Parse Hatası: Lütfen formatı kontrol edin.' });
    }
  };

  if (!isOpen) return null;

  return (
    <aside className={`fixed right-0 top-[73px] h-[calc(100vh-73px)] w-[90%] sm:w-[500px] max-w-full bg-surface-elevated border-l border-border-subtle shadow-2xl flex flex-col transition-transform duration-300 z-40 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-surface-secondary">
        <h2 className="text-lg font-semibold text-text-primary m-0 flex items-center gap-2"><Play size={18} className="text-neon-blue" /> Simülasyon</h2>
        <button className="text-text-secondary hover:text-text-primary" onClick={onClose}>&times;</button>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-border-subtle bg-space-900 px-4 pt-4">
        <button 
          onClick={() => setActiveTab('single')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'single' ? 'border-neon-blue text-neon-blue' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
        >
          Tekil Test (JSON)
        </button>
        <button 
          onClick={() => setActiveTab('batch')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'batch' ? 'border-neon-blue text-neon-blue' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
        >
          <FileJson size={14} /> Toplu Test (JSON)
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {conflicts.length > 0 && (
          <div className="bg-amber-950/20 border border-amber-600/30 text-amber-500 p-3 rounded text-sm">
            <strong className="block mb-1">Dikkat!</strong>
            <ul className="list-disc pl-4 space-y-1">
              {conflicts.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </div>
        )}

        {activeTab === 'single' ? (
          <>
            <p className="text-sm text-text-secondary m-0">Test verisini JSON formatında girin.</p>
            <textarea 
              className="w-full h-[250px] bg-space-900 border border-border-subtle text-text-primary font-mono text-sm p-3 rounded-md resize-none outline-none focus:border-neon-blue focus:shadow-[0_0_10px_rgba(14,165,233,0.2)]"
              value={jsonInput}
              onChange={e => setJsonInput(e.target.value)}
              spellCheck={false}
            />
            <Button onClick={handleSingleTest} className="w-full" variant="primary" isLoading={isEvaluating}>
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
          </>
        ) : (
          <>
            <p className="text-sm text-text-secondary m-0">Dizi (Array) formatında JSON test verilerini girin.</p>
            <textarea 
              className="w-full h-[200px] bg-space-900 border border-border-subtle text-text-primary font-mono text-sm p-3 rounded-md resize-none outline-none focus:border-neon-blue focus:shadow-[0_0_10px_rgba(14,165,233,0.2)]"
              value={batchJsonContent}
              onChange={e => setBatchJsonContent(e.target.value)}
              spellCheck={false}
            />
            <Button onClick={handleBatchTest} className="w-full" variant="primary" isLoading={batchMutation.isPending}>
              <UploadCloud size={16} /> Toplu Testi Başlat
            </Button>

            {batchResult && batchResult.error && (
               <div className="p-4 rounded-lg border bg-red-500/10 border-red-500/30 text-red-400 text-sm">
                 {batchResult.error}
               </div>
            )}

            {batchResult && batchResult.data && (
              <div className="flex flex-col gap-4 mt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-space-800 p-4 rounded-lg border border-border-subtle text-center">
                    <div className="text-xs text-text-secondary uppercase">Başarılı</div>
                    <div className="text-xl font-bold text-neon-blue">{batchResult.data.matchedRecords}</div>
                  </div>
                  <div className="bg-space-800 p-4 rounded-lg border border-border-subtle text-center">
                    <div className="text-xs text-text-secondary uppercase">Başarısız</div>
                    <div className="text-xl font-bold text-red-400">{batchResult.data.failedRecords}</div>
                  </div>
                </div>
                
                <div className="h-[200px] bg-space-800 rounded-lg border border-border-subtle p-2 flex justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={[
                          { name: 'Başarılı', value: batchResult.data.matchedRecords },
                          { name: 'Başarısız', value: batchResult.data.failedRecords }
                        ]} 
                        cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value"
                      >
                        {[{ name: 'Başarılı', value: batchResult.data.matchedRecords }, { name: 'Başarısız', value: batchResult.data.failedRecords }].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="bg-space-800 rounded-lg border border-border-subtle overflow-hidden">
                  <div className="px-4 py-2 bg-space-900 border-b border-border-subtle text-xs font-semibold text-text-secondary uppercase">
                    Başarısız Veriler (Örneklem)
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <tbody>
                        {batchResult.data.results
                          .filter((r: any) => !r.matched)
                          .slice(0, 5) // Sadece ilk 5 başarısız sonucu gösterir
                          .map((res: any, idx: number) => (
                            <tr key={idx} className="border-b border-border-subtle last:border-0 hover:bg-space-700/50">
                              <td className="p-2 text-text-muted font-mono">{JSON.stringify(res.fact)}</td>
                            </tr>
                        ))}
                        {batchResult.data.failedRecords === 0 && (
                          <tr><td className="p-4 text-center text-text-muted">Tüm veriler başarıyla eşleşti!</td></tr>
                        )}
                        {batchResult.data.failedRecords > 5 && (
                          <tr><td className="p-2 text-center text-neon-blue text-[10px]">... ve {batchResult.data.failedRecords - 5} satır daha</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
