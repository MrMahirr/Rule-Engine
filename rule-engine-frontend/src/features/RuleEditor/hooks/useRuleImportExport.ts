import { useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { RuleExportSchema } from '../types/ruleExport.types';
import { ASTNode, ASTActionNode } from '../types/ast.types';
import { useToast } from '../../../shared/components';

interface ExportParams {
  ruleName: string;
  ruleDesc: string;
  nodes: Node[];
  edges: Edge[];
  ast: ASTNode | null;
  actions: ASTActionNode[];
}

export function useRuleImportExport(
  setNodes: (nodes: Node[]) => void, 
  setEdges: (edges: Edge[]) => void, 
  setRuleName: (name: string) => void, 
  setRuleDesc: (desc: string) => void
) {
  const { success, error } = useToast();

  const exportRule = useCallback((params: ExportParams) => {
    const data: RuleExportSchema = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      rule: {
        name: params.ruleName || 'Yeni Kural',
        description: params.ruleDesc || '',
      },
      ast: params.ast,
      actions: params.actions,
      canvas: {
        nodes: params.nodes,
        edges: params.edges,
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rule_${data.rule.name.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    success('Dışa Aktarıldı', 'Kural başarıyla JSON formatında indirildi.');
  }, [success]);

  const importRule = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content) as RuleExportSchema;

        if (!data.version || !data.canvas || !data.canvas.nodes) {
          throw new Error('Geçersiz dosya formatı.');
        }

        setNodes(data.canvas.nodes);
        setEdges(data.canvas.edges);
        setRuleName(data.rule.name);
        setRuleDesc(data.rule.description);
        
        success('İçe Aktarıldı', `'${data.rule.name}' kuralı başarıyla yüklendi.`);
      } catch (err) {
        console.error('Import failed', err);
        error('İçe Aktarma Başarısız', 'Geçersiz veya bozuk bir JSON dosyası seçtiniz.');
      }
    };
    reader.readAsText(file);
  }, [setNodes, setEdges, setRuleName, setRuleDesc, success, error]);

  return { exportRule, importRule };
}
