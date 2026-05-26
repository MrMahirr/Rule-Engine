import { useCallback } from 'react';
import { Node, Edge, useReactFlow } from '@xyflow/react';
import dagre from 'dagre';

const nodeWidth = 250;
const nodeHeight = 150;

export function useAutoLayout(
  nodes: Node[],
  edges: Edge[],
  setNodes: (nodes: Node[]) => void,
  takeSnapshot: () => void
) {
  const { fitView } = useReactFlow();

  const autoLayout = useCallback(() => {
    if (nodes.length === 0) return;
    
    takeSnapshot();
    
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    
    // LR = Left to Right (Soldan sağa akış kural motorları için en iyisidir)
    dagreGraph.setGraph({ rankdir: 'LR', align: 'UL', nodesep: 50, ranksep: 150 });

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const newNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - nodeWidth / 2,
          y: nodeWithPosition.y - nodeHeight / 2,
        },
      };
    });

    setNodes(newNodes);

    // setTimeout is needed because React Flow needs a render cycle to update node positions
    setTimeout(() => {
      fitView({ duration: 800, padding: 0.2 });
    }, 50);
    
  }, [nodes, edges, setNodes, takeSnapshot, fitView]);

  return { autoLayout };
}
