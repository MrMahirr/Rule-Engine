import React, { useState } from 'react';
import { useRuleListLogic } from '../../hooks/useRuleListLogic';
import { Button, Input, Card, Switch, Skeleton } from '../../../../shared/components';
import './RuleListPanel.css';

export function RuleListPanel() {
  const { 
    rules, isLoading, isError, 
    handleSearch, handleDelete, handleToggle, handleClone,
    selectedRuleId, setSelectedRuleId 
  } = useRuleListLogic();
  
  const [searchInput, setSearchInput] = useState('');

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchInput);
  };

  return (
    <aside className="rule-list-panel">
      <div className="panel-header">
        <h2>Kayıtlı Kurallar</h2>
        <form onSubmit={onSearchSubmit} className="search-form">
          <Input 
            placeholder="Kural ara..." 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            fullWidth
          />
          <Button type="submit" variant="secondary" size="sm">Ara</Button>
        </form>
      </div>

      <div className="rules-container">
        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
            <Skeleton height="80px" borderRadius="8px" count={3} />
          </div>
        )}
        {isError && <div className="panel-message error">Kurallar yüklenemedi.</div>}
        
        {!isLoading && !isError && rules.length === 0 && (
          <div className="panel-message">Hiç kural bulunamadı.</div>
        )}

        {!isLoading && !isError && rules.length > 0 && (() => {
          const grouped = rules.reduce((acc, rule) => {
            const cat = rule.category || 'Genel';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(rule);
            return acc;
          }, {} as Record<string, typeof rules>);

          return Object.entries(grouped).map(([cat, catRules]) => (
            <div key={cat} style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '0.25rem' }}>
                {cat} <span style={{ opacity: 0.5 }}>({catRules.length})</span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {catRules.map(rule => (
                  <Card 
                    key={rule.id} 
                    className={`rule-list-item ${selectedRuleId === rule.id ? 'active' : ''}`}
                    glowOnHover
                    glowColor="cyan"
                    onClick={() => setSelectedRuleId(rule.id)}
                  >
                    <div className="rule-item-content">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h4 style={{ margin: 0, opacity: rule.isActive === false ? 0.5 : 1 }}>{rule.name}</h4>
                        {rule.isActive === false && <span style={{ fontSize: '10px', backgroundColor: '#ef4444', padding: '2px 4px', borderRadius: '4px' }}>Pasif</span>}
                      </div>
                      <p style={{ opacity: rule.isActive === false ? 0.5 : 1 }}>{rule.description}</p>
                    </div>
                    <div className="rule-item-actions" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
                      <div onClick={e => e.stopPropagation()} title="Aktif/Pasif Yap">
                        <Switch 
                          checked={rule.isActive !== false} 
                          onChange={() => handleToggle(rule.id, rule.isActive !== false)} 
                        />
                      </div>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={(e) => { e.stopPropagation(); handleClone(rule); }}
                      >
                        Kopyala
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={(e) => { e.stopPropagation(); handleDelete(rule.id, rule.name); }}
                      >
                        Sil
                      </Button>
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
