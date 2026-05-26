import React, { useState } from 'react';
import { useRuleListLogic } from '../../hooks/useRuleListLogic';
import { Button, Input, Card } from '../../../../shared/components';
import './RuleListPanel.css';

export function RuleListPanel() {
  const { 
    rules, isLoading, isError, 
    handleSearch, handleDelete, 
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
        {isLoading && <div className="panel-message loading"><span className="spinner"></span> Yükleniyor...</div>}
        {isError && <div className="panel-message error">Kurallar yüklenemedi.</div>}
        
        {!isLoading && !isError && rules.length === 0 && (
          <div className="panel-message">Hiç kural bulunamadı.</div>
        )}

        {!isLoading && !isError && rules.map(rule => (
          <Card 
            key={rule.id} 
            className={`rule-list-item ${selectedRuleId === rule.id ? 'active' : ''}`}
            glowOnHover
            glowColor="cyan"
            onClick={() => setSelectedRuleId(rule.id)}
          >
            <div className="rule-item-content">
              <h4>{rule.name}</h4>
              <p>{rule.description}</p>
            </div>
            <div className="rule-item-actions">
              <Button 
                variant="danger" 
                size="sm" 
                onClick={(e) => { e.stopPropagation(); handleDelete(rule.id); }}
              >
                Sil
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </aside>
  );
}
