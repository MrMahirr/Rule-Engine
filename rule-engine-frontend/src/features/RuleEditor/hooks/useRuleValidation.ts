import { useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { RuleNodeType } from '../types/ruleNode.types';

export function useRuleValidation() {
  const validateRule = useCallback((nodes: Node[], edges: Edge[]) => {
    const errors: string[] = [];

    // 1. Check if Action node exists
    const actionNodes = nodes.filter(n => n.type === RuleNodeType.ACTION);
    if (actionNodes.length === 0) {
      errors.push('Kuralın bir aksiyon düğümü (Action) olması gerekir.');
    } else if (actionNodes.length > 1) {
      errors.push('Sadece bir tane aksiyon düğümü (Action) bulunabilir.');
    }

    // 2. Check if all Condition nodes have values
    nodes.filter(n => n.type === RuleNodeType.CONDITION).forEach(node => {
      if (!node.data.field || !node.data.value) {
        errors.push(`Lütfen tüm koşul alanlarını doldurun. Eksik düğüm ID: ${node.id}`);
      }
    });

    // 3. Check for disconnected nodes (every node must be connected to an edge, except if there's only 1 action node with no conditions)
    if (nodes.length > 1) {
      nodes.forEach(node => {
        const isConnected = edges.some(e => e.source === node.id || e.target === node.id);
        if (!isConnected) {
          errors.push(`Bağlantısı kopuk bir düğüm var. Lütfen ağaca bağlayın veya silin. ID: ${node.id}`);
        }
      });
    }

    // 4. Validate Logic Gates have at least 2 inputs
    nodes.filter(n => n.type === RuleNodeType.LOGIC_GATE).forEach(node => {
      const inputs = edges.filter(e => e.target === node.id);
      if (inputs.length < 2) {
        errors.push(`Mantık kapıları (AND/OR) en az 2 giriş almalıdır. ID: ${node.id}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  return { validateRule };
}
