import { Node, Edge } from '@xyflow/react';
import { ASTNode, ASTActionNode } from './ast.types';

export interface RuleExportSchema {
  version: string;
  exportedAt: string;
  rule: {
    name: string;
    description: string;
  };
  ast: ASTNode | null;
  action: ASTActionNode | null;
  canvas: {
    nodes: Node[];
    edges: Edge[];
  };
}
