import { useCallback } from 'react';
import { useReactFlow, Node } from '@xyflow/react';
import { RuleNodeType, ConditionOperator, LogicGateType } from '../types/ruleNode.types';

let idCounter = 0;
const getId = () => `node_${idCounter++}`;

export function useNodeDragAndDrop(
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>, 
  updateNodeData: (id: string, dataPatch: any) => void
) {
  const { screenToFlowPosition } = useReactFlow();

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow') as RuleNodeType;
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNodeId = getId();

      // Hook up the onChange callback to the node's initial data
      const onChangeCallback = (id: string, dataPatch: any) => {
        updateNodeData(id, dataPatch);
      };

      let initialData: any = { onChange: onChangeCallback };

      switch (type) {
        case RuleNodeType.CONDITION:
          initialData = { ...initialData, field: '', operator: ConditionOperator.EQUALS, value: '' };
          break;
        case RuleNodeType.LOGIC_GATE:
          initialData = { ...initialData, gateType: LogicGateType.AND };
          break;
        case RuleNodeType.ACTION:
          initialData = { ...initialData, actionType: 'ALLOW', params: {} };
          break;
      }

      const newNode: Node = {
        id: newNodeId,
        type,
        position,
        data: initialData,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes, updateNodeData]
  );

  return {
    onDragOver,
    onDrop
  };
}
