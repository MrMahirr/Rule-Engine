import { useMemo } from 'react';
import { ASTNode, ASTActionNode } from '../types/ast.types';
import { useRulesQuery } from '../services/useRuleQueries';

export function useConflictDetection(currentAst: ASTNode | null, currentActions: ASTActionNode[]) {
  const { data: rulesData } = useRulesQuery({});
  const existingRules = rulesData?.data || [];

  const conflicts = useMemo(() => {
    if (!currentAst || currentActions.length === 0 || !existingRules) return [];

    const foundConflicts: string[] = [];

    const currentAstStr = JSON.stringify(currentAst);
    const currentActionsStr = JSON.stringify(currentActions.map((a: ASTActionNode) => a.actionType).sort());

    for (const rule of existingRules) {
      if (!rule.ast || !rule.actions || rule.isActive === false) continue;

      const ruleAstStr = JSON.stringify(rule.ast);
      const ruleActionsStr = JSON.stringify(rule.actions.map((a: ASTActionNode) => a.actionType).sort());

      // Çakışma durumu: Koşullar birebir aynı, fakat aksiyonlar farklı ise
      if (currentAstStr === ruleAstStr && currentActionsStr !== ruleActionsStr) {
        foundConflicts.push(`Çakışma: "${rule.name}" kuralı ile aynı koşullara sahip fakat farklı aksiyon tetikliyor.`);
      }
    }

    return foundConflicts;
  }, [currentAst, currentActions, existingRules]);

  return conflicts;
}
