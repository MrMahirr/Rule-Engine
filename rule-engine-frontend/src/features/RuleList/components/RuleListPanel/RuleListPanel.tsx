import React, { useState, useMemo } from 'react';
import { useRuleListLogic } from '../../hooks/useRuleListLogic';
import { Button, Input, Switch, Skeleton, Card } from '../../../../shared/components';
import { Trash2, Copy, Play, Tag, Clock } from 'lucide-react';

interface RuleListPanelProps {
  selectedRuleId: string | null;
  setSelectedRuleId: (id: string | null) => void;
}

export function RuleListPanel({ selectedRuleId, setSelectedRuleId }: RuleListPanelProps) {
  const { 
    rules, isLoading, isError, 
    handleDelete, handleToggle, handleClone
  } = useRuleListLogic(selectedRuleId, setSelectedRuleId);
  
  const [searchInput, setSearchInput] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = useMemo(() => {
    const cats = new Set(rules.map(r => r.category || 'Genel'));
    return ['all', ...Array.from(cats)];
  }, [rules]);

  const filteredRules = useMemo(() => {
    return rules.filter(rule => {
      const matchesSearch = rule.name.toLowerCase().includes(searchInput.toLowerCase());
      const matchesStatus = filterStatus === 'all' || (filterStatus === 'active' ? rule.isActive !== false : rule.isActive === false);
      const matchesCategory = filterCategory === 'all' || (rule.category || 'Genel') === filterCategory;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [rules, searchInput, filterStatus, filterCategory]);

  return (
    <aside className="w-full lg:w-[350px] h-[400px] lg:h-full bg-surface-elevated border-t lg:border-t-0 lg:border-l border-border-subtle flex flex-col z-10 shrink-0">
      <div className="p-4 border-b border-border-subtle flex flex-col gap-3 bg-surface-secondary">
        <h2 className="m-0 text-lg font-semibold text-text-primary">Kayıtlı Kurallar</h2>
        
        <Input 
          placeholder="Kural ara..." 
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          fullWidth
        />

        <div className="flex gap-2">
          <select 
            className="flex-1 bg-space-900 border border-border-subtle rounded text-text-primary text-xs p-2 outline-none focus:border-neon-blue"
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value as any)}
          >
            <option value="all">Tümü (Durum)</option>
            <option value="active">Sadece Aktifler</option>
            <option value="inactive">Sadece Pasifler</option>
          </select>
          <select 
            className="flex-1 bg-space-900 border border-border-subtle rounded text-text-primary text-xs p-2 outline-none focus:border-neon-blue"
            value={filterCategory} 
            onChange={e => setFilterCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat === 'all' ? 'Tüm Kategoriler' : cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {isLoading && <Skeleton count={5} height="80px" />}
        
        {isError && <div className="text-red-400 text-sm p-4 bg-red-500/10 rounded">Kurallar yüklenemedi.</div>}
        
        {!isLoading && !isError && filteredRules.length === 0 && (
          <div className="text-center p-8 text-text-muted border border-dashed border-border-subtle rounded-lg bg-space-900/50">Hiç kural bulunamadı.</div>
        )}

        {!isLoading && !isError && filteredRules.length > 0 && (() => {
          // Sort by priority first (lower number = higher priority)
          const sortedRules = [...filteredRules].sort((a, b) => (a.priority || 99) - (b.priority || 99));

          const grouped = sortedRules.reduce((acc, rule) => {
            const cat = rule.category || 'Genel';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(rule);
            return acc;
          }, {} as Record<string, typeof rules>);

          return Object.entries(grouped).map(([cat, catRules]) => (
            <div key={cat} className="mb-6">
              <h3 className="m-0 mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted border-b border-border-subtle pb-1">
                {cat} <span className="opacity-50">({catRules.length})</span>
              </h3>
              <div className="flex flex-col gap-3">
                {catRules.map(rule => (
                  <Card 
                    key={rule.id} 
                    className={`p-3 bg-space-900 border ${rule.isActive === false ? 'border-border-subtle opacity-70' : selectedRuleId === rule.id ? 'border-neon-blue shadow-[0_0_10px_rgba(14,165,233,0.2)]' : 'border-border-subtle hover:border-neon-blue/50'} transition-all cursor-pointer`}
                    onClick={() => setSelectedRuleId(rule.id)}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="m-0 text-sm font-semibold text-text-primary truncate max-w-[150px]" title={rule.name}>{rule.name}</h4>
                          {rule.priority && <span className="text-[10px] bg-neon-blue/10 text-neon-blue border border-neon-blue/20 px-1.5 py-0.5 rounded">P{rule.priority}</span>}
                          {rule.isActive === false && <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded">Pasif</span>}
                        </div>
                        <div onClick={e => e.stopPropagation()} title="Aktif/Pasif Yap">
                          <Switch 
                            checked={rule.isActive !== false} 
                            onChange={() => handleToggle(rule.id, rule.isActive !== false)} 
                          />
                        </div>
                      </div>
                      <p className="m-0 text-xs text-text-secondary line-clamp-2">{rule.description || 'Açıklama yok'}</p>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-subtle">
                        <span className="text-[10px] text-text-muted flex items-center gap-1"><Clock size={10} /> {new Date(rule.updatedAt).toLocaleDateString()}</span>
                        <div className="flex items-center gap-1">
                            <button className="btn-icon p-1" onClick={(e) => { e.stopPropagation(); handleClone(rule); }} title="Kopyala"><Copy size={14} /></button>
                            <button className="btn-icon p-1 hover:text-red-400 hover:bg-red-500/10" onClick={(e) => { e.stopPropagation(); handleDelete(rule.id, rule.name); }} title="Sil"><Trash2 size={14} /></button>
                        </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ));
        })()}
      </div>
    </aside>
  );
}
