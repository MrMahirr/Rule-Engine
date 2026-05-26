import { useState, useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';

export function useHistory(
  nodes: Node[], 
  edges: Edge[], 
  setNodes: (nodes: Node[]) => void, 
  setEdges: (edges: Edge[]) => void
) {
  const [past, setPast] = useState<{nodes: Node[], edges: Edge[]}[]>([]);
  const [future, setFuture] = useState<{nodes: Node[], edges: Edge[]}[]>([]);

  const takeSnapshot = useCallback(() => {
    // Deep copy to prevent reference mutation issues
    setPast(prev => {
      const newPast = [...prev, { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }];
      // Limit history stack to 50
      if (newPast.length > 50) return newPast.slice(newPast.length - 50);
      return newPast;
    });
    setFuture([]);
  }, [nodes, edges]);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    
    setFuture(prev => [{ nodes, edges }, ...prev]);
    setPast(newPast);
    setNodes(previous.nodes);
    setEdges(previous.edges);
  }, [past, nodes, edges, setNodes, setEdges]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    
    setPast(prev => [...prev, { nodes, edges }]);
    setFuture(newFuture);
    setNodes(next.nodes);
    setEdges(next.edges);
  }, [future, nodes, edges, setNodes, setEdges]);

  return { takeSnapshot, undo, redo, canUndo: past.length > 0, canRedo: future.length > 0 };
}
