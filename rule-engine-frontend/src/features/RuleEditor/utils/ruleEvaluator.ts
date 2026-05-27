import { ASTNode, ASTConditionNode, ASTLogicNode } from '../types/ast.types';

export function evaluateAST(ast: ASTNode | null, data: any): boolean {
  if (!ast) return false;

  if (ast.type === 'CONDITION') {
    const condition = ast as ASTConditionNode;
    const fieldValue = data[condition.field];

    if (fieldValue === undefined || fieldValue === null) return false;

    const valueStr = String(fieldValue).toLowerCase();
    const targetStr = String(condition.value).toLowerCase();

    switch (condition.operator) {
      case '==': return valueStr === targetStr;
      case '!=': return valueStr !== targetStr;
      case '>': return Number(fieldValue) > Number(condition.value);
      case '<': return Number(fieldValue) < Number(condition.value);
      case '>=': return Number(fieldValue) >= Number(condition.value);
      case '<=': return Number(fieldValue) <= Number(condition.value);
      case 'contains': return valueStr.includes(targetStr);
      case 'not_contains': return !valueStr.includes(targetStr);
      default: return false;
    }
  }

  if (ast.type === 'AND' || ast.type === 'OR') {
    const logic = ast as ASTLogicNode;
    if (!logic.children || logic.children.length === 0) return false;

    if (ast.type === 'AND') {
      return logic.children.every(child => evaluateAST(child, data));
    } else { // OR
      return logic.children.some(child => evaluateAST(child, data));
    }
  }

  return false;
}
