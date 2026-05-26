import React from 'react';
import { RuleNodeType } from '../../types/ruleNode.types';
import './NodePalette.css';

export function NodePalette() {
  const onDragStart = (event: React.DragEvent, nodeType: RuleNodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="node-palette">
      <div className="palette-header">
        <h2>Bileşenler</h2>
      </div>
      <div className="palette-items">
        <div 
          className="palette-item condition" 
          onDragStart={(event) => onDragStart(event, RuleNodeType.CONDITION)} 
          draggable
        >
          <div className="item-icon"></div>
          <span>Koşul (Condition)</span>
        </div>
        
        <div 
          className="palette-item logic" 
          onDragStart={(event) => onDragStart(event, RuleNodeType.LOGIC_GATE)} 
          draggable
        >
          <div className="item-icon"></div>
          <span>Mantık Kapısı (AND/OR)</span>
        </div>
        
        <div 
          className="palette-item action" 
          onDragStart={(event) => onDragStart(event, RuleNodeType.ACTION)} 
          draggable
        >
          <div className="item-icon"></div>
          <span>Aksiyon (Action)</span>
        </div>
      </div>
      <div className="palette-info">
        Sürükleyip çalışma alanına bırakın.
      </div>
    </aside>
  );
}
