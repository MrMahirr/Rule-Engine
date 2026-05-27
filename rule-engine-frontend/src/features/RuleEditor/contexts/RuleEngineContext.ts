import React, { createContext, useContext } from 'react';

export interface RuleEngineContextType {
  takeSnapshot: () => void;
}

export const RuleEngineContext = createContext<RuleEngineContextType | null>(null);

export function useRuleEngineContext() {
  const context = useContext(RuleEngineContext);
  if (!context) {
    throw new Error('useRuleEngineContext must be used within a RuleEngineProvider');
  }
  return context;
}
