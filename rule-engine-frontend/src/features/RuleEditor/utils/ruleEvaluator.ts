import { ASTNode, ASTConditionNode, ASTLogicNode } from '../types/ast.types';

export function evaluateAST(ast: ASTNode | null, data: any): boolean {
  if (!ast) return false;

  if (ast.type === 'CONDITION') {
    const condition = ast as ASTConditionNode;
    const fieldValue = data[condition.field];

    if (fieldValue === undefined || fieldValue === null) return false;

    const valueStr = String(fieldValue);
    const targetStr = String(condition.value);

    switch (condition.operator) {
      case '==': return valueStr.toLowerCase() === targetStr.toLowerCase();
      case '!=': return valueStr.toLowerCase() !== targetStr.toLowerCase();
      case '>': {
        if (isNaN(Number(valueStr)) && !isNaN(Date.parse(valueStr)) && !isNaN(Date.parse(targetStr))) {
          return new Date(valueStr) > new Date(targetStr);
        }
        return Number(fieldValue) > Number(condition.value);
      }
      case '<': {
        if (isNaN(Number(valueStr)) && !isNaN(Date.parse(valueStr)) && !isNaN(Date.parse(targetStr))) {
          return new Date(valueStr) < new Date(targetStr);
        }
        return Number(fieldValue) < Number(condition.value);
      }
      case '>=': {
        if (isNaN(Number(valueStr)) && !isNaN(Date.parse(valueStr)) && !isNaN(Date.parse(targetStr))) {
          return new Date(valueStr) >= new Date(targetStr);
        }
        return Number(fieldValue) >= Number(condition.value);
      }
      case '<=': {
        if (isNaN(Number(valueStr)) && !isNaN(Date.parse(valueStr)) && !isNaN(Date.parse(targetStr))) {
          return new Date(valueStr) <= new Date(targetStr);
        }
        return Number(fieldValue) <= Number(condition.value);
      }
      case 'contains': return valueStr.includes(targetStr);
      case 'not_contains': return !valueStr.includes(targetStr);
      case 'in': {
        const arr = targetStr.split(',').map(s => s.trim());
        return arr.includes(valueStr);
      }
      case 'not_in': {
        const arr = targetStr.split(',').map(s => s.trim());
        return !arr.includes(valueStr);
      }
      case 'starts_with':
        return valueStr.startsWith(targetStr);
      case 'ends_with':
        return valueStr.endsWith(targetStr);
      case 'matches':
        try {
          const regex = new RegExp(targetStr);
          return regex.test(valueStr);
        } catch (e) {
          return false;
        }
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
