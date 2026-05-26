import { useCallback } from 'react';
import {
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
} from '@xyflow/react';
import { RuleNodeType } from '../types/ruleNode.types';
import { ASTNode, ASTActionNode, ASTConditionNode, ASTLogicNode } from '../types/ast.types';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export function useRuleEngine() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const updateNodeData = useCallback((id: string, dataPatch: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, ...dataPatch } };
        }
        return node;
      })
    );
  }, [setNodes]);

  const toAST = useCallback((): { ast: ASTNode | null; action: ASTActionNode | null } => {
    // 1. Find the Action Node (Root of execution)
    const actionNode = nodes.find(n => n.type === RuleNodeType.ACTION);
    if (!actionNode) {
      return { ast: null, action: null };
    }

    const actionData: ASTActionNode = {
      type: 'ACTION',
      actionType: actionNode.data.actionType as ASTActionNode['actionType'],
      params: (actionNode.data.params as Record<string, string>) || {},
    };

    // 2. Build the Condition/Logic Tree
    // Find the node connected to the Action Node's target handle.
    const edgeToAction = edges.find(e => e.target === actionNode.id);
    if (!edgeToAction) {
      return { ast: null, action: actionData };
    }

    const buildTree = (nodeId: string): ASTNode | null => {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return null;

      if (node.type === RuleNodeType.CONDITION) {
        return {
          type: 'CONDITION',
          field: node.data.field as string,
          operator: node.data.operator as string,
          value: node.data.value as string,
        } as ASTConditionNode;
      }

      if (node.type === RuleNodeType.LOGIC_GATE) {
        // Find all incoming edges to this logic gate
        const incomingEdges = edges.filter(e => e.target === nodeId);
        const children = incomingEdges
          .map(e => buildTree(e.source))
          .filter(Boolean) as ASTNode[];
        
        return {
          type: node.data.gateType as 'AND' | 'OR',
          children
        } as ASTLogicNode;
      }

      return null;
    };

    const rootConditionId = edgeToAction.source;
    const ast = buildTree(rootConditionId);

    return { ast, action: actionData };
  }, [nodes, edges]);

  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    updateNodeData,
    toAST
  };
}
