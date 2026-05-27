import { useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { ASTNode, ASTActionNode, ASTConditionNode, ASTLogicNode } from '../types/ast.types';
import { RuleNodeType } from '../types/ruleNode.types';

export function useASTParser() {
  const parseAST = useCallback((
    ast: ASTNode | null,
    actions: ASTActionNode[],
    updateNodeData: (id: string, dataPatch: any) => void
  ) => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let idCounter = 0;

    const generateId = (prefix: string) => `${prefix}_${idCounter++}_${Date.now()}`;

    const onChange = (id: string, dataPatch: any) => updateNodeData(id, dataPatch);

    // 1. Process Actions
    const actionNodeIds: string[] = [];
    actions.forEach((action) => {
      const actionId = generateId('node_action');
      actionNodeIds.push(actionId);
      nodes.push({
        id: actionId,
        type: RuleNodeType.ACTION,
        position: { x: 0, y: 0 },
        data: {
          actionType: action.actionType,
          params: action.params || {},
          onChange,
        },
      });
    });

    if (!ast) return { nodes, edges };

    // 2. Process AST recursively
    const traverse = (node: ASTNode): string => {
      const nodeId = generateId('node_ast');
      
      if (node.type === 'CONDITION') {
        const condNode = node as ASTConditionNode;
        nodes.push({
          id: nodeId,
          type: RuleNodeType.CONDITION,
          position: { x: 0, y: 0 },
          data: {
            field: condNode.field,
            operator: condNode.operator,
            value: condNode.value,
            onChange,
          },
        });
        return nodeId;
      } else {
        const logicNode = node as ASTLogicNode;
        nodes.push({
          id: nodeId,
          type: RuleNodeType.LOGIC_GATE,
          position: { x: 0, y: 0 },
          data: {
            gateType: logicNode.type,
            onChange,
          },
        });

        // Traverse children and connect them to this logic gate
        logicNode.children.forEach(child => {
          const childId = traverse(child);
          edges.push({
            id: generateId('edge'),
            source: childId,
            target: nodeId,
            animated: true,
          });
        });
        return nodeId;
      }
    };

    const rootId = traverse(ast);

    // 3. Connect root to all action nodes
    actionNodeIds.forEach(actionId => {
      edges.push({
        id: generateId('edge_action'),
        source: rootId,
        target: actionId,
        animated: true,
      });
    });

    return { nodes, edges };
  }, []);

  return { parseAST };
}
