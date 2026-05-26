export type ASTNode =
  | ASTConditionNode
  | ASTLogicNode;

export interface ASTConditionNode {
  type: 'CONDITION';
  field: string;
  operator: string;
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
  isActive: boolean;
  ast: ASTNode | null;
  actions: ASTActionNode[];
}

export interface RuleResponse extends RulePayload {
  id: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}
