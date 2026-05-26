import { Node } from '@xyflow/react';

export enum ConditionOperator {
  EQUALS = '==',
  NOT_EQUALS = '!=',
  GREATER_THAN = '>',
  LESS_THAN = '<',
  GREATER_EQUAL = '>=',
  LESS_EQUAL = '<=',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
}

export enum LogicGateType {
  AND = 'AND',
  OR = 'OR',
}

export enum RuleNodeType {
  CONDITION = 'condition',
  LOGIC_GATE = 'logic_gate',
  ACTION = 'action',
}

export interface ConditionNodeData extends Record<string, unknown> {
  field: string;
  operator: ConditionOperator;
  value: string;
  onChange?: (id: string, data: Partial<ConditionNodeData>) => void;
}

export interface LogicGateNodeData extends Record<string, unknown> {
  gateType: LogicGateType;
  onChange?: (id: string, data: Partial<LogicGateNodeData>) => void;
}

export interface ActionNodeData extends Record<string, unknown> {
  actionType: 'ALLOW' | 'DENY' | 'LOG' | 'NOTIFY' | 'CUSTOM';
  params: Record<string, string>;
  onChange?: (id: string, data: Partial<ActionNodeData>) => void;
}

export type ConditionFlowNode = Node<ConditionNodeData, 'condition'>;
export type LogicGateFlowNode = Node<LogicGateNodeData, 'logic_gate'>;
export type ActionFlowNode = Node<ActionNodeData, 'action'>;

export type RuleEngineNode = ConditionFlowNode | LogicGateFlowNode | ActionFlowNode;
