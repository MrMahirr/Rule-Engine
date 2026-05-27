import { useCallback, useState } from 'react';
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
import { useHistory } from './useHistory';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export function useRuleEngine() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [clipboard, setClipboard] = useState<{ nodes: Node[], edges: Edge[] } | null>(null);

  const { takeSnapshot, undo, redo, canUndo, canRedo } = useHistory(nodes, edges, setNodes as any, setEdges as any);

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      takeSnapshot();
      setEdges((eds) => addEdge({ ...params, animated: true }, eds));
    },
    [setEdges, takeSnapshot]
  );

  const updateNodeData = useCallback((id: string, dataPatch: any) => {
    takeSnapshot();
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, ...dataPatch } };
        }
        return node;
      })
    );
  }, [setNodes]);

  const toAST = useCallback((): { ast: ASTNode | null; actions: ASTActionNode[] } => {
    // 1. Find the Action Nodes
    const actionNodes = nodes.filter(n => n.type === RuleNodeType.ACTION);
    const actions: ASTActionNode[] = actionNodes.map(n => ({
      type: 'ACTION',
      actionType: n.data.actionType as ASTActionNode['actionType'],
      params: (n.data.params as Record<string, string>) || {},
    }));

    if (actions.length === 0) {
      return { ast: null, actions: [] };
    }

    // 2. Build the Condition/Logic Tree
    // Find an edge connecting TO the first action node
    const edgeToAction = edges.find(e => e.target === actionNodes[0].id);
    if (!edgeToAction) {
      return { ast: null, actions };
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

    return { ast, actions };
  }, [nodes, edges]);

  const copySelection = useCallback(() => {
    const selectedNodes = nodes.filter(n => n.selected);
    const selectedEdges = edges.filter(e => 
      e.selected || (selectedNodes.some(n => n.id === e.source) && selectedNodes.some(n => n.id === e.target))
    );
    
    if (selectedNodes.length > 0) {
      setClipboard({ nodes: selectedNodes, edges: selectedEdges });
    }
  }, [nodes, edges]);

  const pasteSelection = useCallback(() => {
    if (!clipboard || clipboard.nodes.length === 0) return;

    takeSnapshot();

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    const idMap = new Map<string, string>();

    clipboard.nodes.forEach(node => {
      const newId = `${node.type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      idMap.set(node.id, newId);

      newNodes.push({
        ...node,
        id: newId,
        position: { x: node.position.x + 50, y: node.position.y + 50 },
        selected: true,
      });
    });

    clipboard.edges.forEach(edge => {
      const source = idMap.get(edge.source);
      const target = idMap.get(edge.target);
      if (source && target) {
        newEdges.push({
          ...edge,
          id: `e-${source}-${target}`,
          source,
          target,
          selected: true
        });
      }
    });

    setNodes(nds => [
      ...nds.map(n => ({ ...n, selected: false })),
      ...newNodes
    ]);

    setEdges(eds => [
      ...eds.map(e => ({ ...e, selected: false })),
      ...newEdges
    ]);
  }, [clipboard, setNodes, setEdges, takeSnapshot]);

  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    updateNodeData,
    toAST,
    takeSnapshot,
    undo,
    redo,
    canUndo,
    canRedo,
    copySelection,
    pasteSelection
  };
}
