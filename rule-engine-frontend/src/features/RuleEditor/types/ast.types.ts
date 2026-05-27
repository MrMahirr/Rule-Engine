export type ASTNode =
  | ASTConditionNode
  | ASTLogicNode;

export type Operator = 
  | '==' 
  | '!=' 
  | '>' 
  | '<' 
  | '>=' 
  | '<=' 
  | 'contains' 
  | 'not_contains'
  | 'in'
  | 'not_in'
  | 'starts_with'
  | 'ends_with'
  | 'matches';

export interface ASTConditionNode {
  type: 'CONDITION';
  field: string;
  operator: Operator;
  value: string;
}

export interface ASTLogicNode {
  type: 'AND' | 'OR';
  children: ASTNode[];
}

export interface ASTActionNode {
  type: 'ACTION';
  actionType: 'ALLOW' | 'DENY' | 'LOG' | 'NOTIFY' | 'CUSTOM';
  params: Record<string, string>;
}

export interface RulePayload {
  name: string;
  description: string;
  category?: string;
  priority?: number;
  isActive: boolean;
  ast: ASTNode | null;
  actions: ASTActionNode[];
}

export interface RuleResponse extends RulePayload {
  id: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface RuleMatchResult {
  ruleId: string;
  ruleName: string;
  actions: ASTActionNode[];
}

export interface RuleEvaluationResponse {
  matched: boolean;
  matchedRules: RuleMatchResult[];
  evaluatedRuleCount: number;
}
