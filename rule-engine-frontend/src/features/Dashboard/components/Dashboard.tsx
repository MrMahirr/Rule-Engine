import React, { useState } from 'react';
import { useDashboardMetrics, useAuditLogs } from '../services/useMetricsQueries';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, CheckCircle, XCircle, Clock } from 'lucide-react';

const COLORS = ['#0ea5e9', '#ef4444']; // neon-blue, red-400

export function Dashboard() {
  const { data: metricsData, isLoading: isMetricsLoading } = useDashboardMetrics();
  const [page, setPage] = useState(0);
  const { data: logsData, isLoading: isLogsLoading } = useAuditLogs(page, 10);

  if (isMetricsLoading) return <div className="p-8 text-text-primary">Metrikler yükleniyor...</div>;

  const metrics = metricsData?.data;
  
  const pieData = [
    { name: 'Başarılı', value: metrics?.matchedEvaluations || 0 },
    { name: 'Başarısız', value: metrics?.failedEvaluations || 0 },
  ];

  return (
    <div className="p-4 lg:p-8 flex flex-col gap-6 lg:gap-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2 mb-2">
          <Activity className="text-neon-blue" />
          Kural Motoru Analitikleri
        </h1>
        <p className="text-text-secondary text-sm">Sistemdeki kuralların anlık çalışma performansını ve istatistiklerini buradan izleyebilirsiniz.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-elevated p-6 rounded-xl border border-border-subtle flex items-center gap-4">
          <div className="p-3 bg-surface-secondary rounded-lg text-text-primary"><Activity size={24} /></div>
          <div>
            <div className="text-sm text-text-secondary uppercase">Toplam Tetiklenme</div>
            <div className="text-2xl font-bold text-text-primary">{metrics?.totalEvaluations || 0}</div>
          </div>
        </div>
        <div className="bg-surface-elevated p-6 rounded-xl border border-border-subtle flex items-center gap-4">
          <div className="p-3 bg-neon-blue/10 rounded-lg text-neon-blue"><CheckCircle size={24} /></div>
          <div>
            <div className="text-sm text-text-secondary uppercase">Başarılı (Matched)</div>
            <div className="text-2xl font-bold text-text-primary">{metrics?.matchedEvaluations || 0}</div>
          </div>
        </div>
        <div className="bg-surface-elevated p-6 rounded-xl border border-border-subtle flex items-center gap-4">
          <div className="p-3 bg-red-400/10 rounded-lg text-red-400"><XCircle size={24} /></div>
          <div>
            <div className="text-sm text-text-secondary uppercase">Başarısız (Failed)</div>
            <div className="text-2xl font-bold text-text-primary">{metrics?.failedEvaluations || 0}</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0 shrink-0">
        <div className="bg-surface-elevated p-6 rounded-xl border border-border-subtle flex flex-col h-[350px] lg:h-[400px]">
          <h3 className="text-sm font-semibold text-text-secondary uppercase mb-4 shrink-0">Başarı Oranı</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius="40%" outerRadius="70%" paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)', borderRadius: '8px', color: 'var(--color-text-primary)' }} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface-elevated p-6 rounded-xl border border-border-subtle flex flex-col h-[350px] lg:h-[400px]">
          <h3 className="text-sm font-semibold text-text-secondary uppercase mb-4 shrink-0">En Çok Tetiklenen Kurallar</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics?.topTriggeredRules || []} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="ruleName" stroke="var(--color-text-secondary)" fontSize={12} width={80} tick={{fill: 'var(--color-text-secondary)'}} />
                <Tooltip cursor={{ fill: 'var(--color-surface-secondary)' }} contentStyle={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)', borderRadius: '8px', color: 'var(--color-text-primary)' }} />
                <Bar dataKey="triggerCount" fill="var(--color-neon-blue)" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-surface-elevated rounded-xl border border-border-subtle overflow-hidden mt-4">
        <div className="p-6 border-b border-border-subtle flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-secondary uppercase flex items-center gap-2">
            <Clock size={16} />
            Son Çalışma Kayıtları (Audit Logs)
          </h3>
        </div>
        <div className="overflow-x-auto overflow-y-auto max-h-[400px]">
          <table className="w-full text-left border-collapse relative">
            <thead className="sticky top-0 z-10">
              <tr className="bg-surface-secondary border-b border-border-subtle text-xs uppercase text-text-muted">
                <th className="p-4 font-medium">Tarih</th>
                <th className="p-4 font-medium">Kural Adı</th>
                <th className="p-4 font-medium">Payload (Gelen Veri)</th>
                <th className="p-4 font-medium">Süre</th>
                <th className="p-4 font-medium">Sonuç</th>
              </tr>
            </thead>
            <tbody>
              {isLogsLoading ? (
                <tr><td colSpan={5} className="p-4 text-center text-text-muted">Yükleniyor...</td></tr>
              ) : logsData?.data?.content?.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center text-text-muted">Henüz kayıt yok.</td></tr>
              ) : (
                logsData?.data?.content?.map(log => (
                  <tr key={log.id} className="border-b border-border-subtle hover:bg-surface-secondary transition-colors">
                    <td className="p-4 text-xs text-text-secondary whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-sm text-text-primary font-medium">{log.ruleName}</td>
                    <td className="p-4 text-xs text-text-muted max-w-[200px] truncate" title={log.factPayload}>
                      {log.factPayload}
                    </td>
                    <td className="p-4 text-xs text-text-secondary">{log.executionTimeMs} ms</td>
                    <td className="p-4">
                      {log.matched ? (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-neon-blue/10 text-neon-blue border border-neon-blue/20 px-2 py-1 rounded-full uppercase font-bold tracking-wider">
                          <CheckCircle size={10} /> Matched
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-red-400/10 text-red-400 border border-red-400/20 px-2 py-1 rounded-full uppercase font-bold tracking-wider">
                          <XCircle size={10} /> Failed
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-border-subtle flex justify-between items-center bg-surface-secondary">
          <span className="text-xs text-text-muted">
            Sayfa {logsData?.data?.number !== undefined ? logsData.data.number + 1 : 1} / {logsData?.data?.totalPages || 1}
          </span>
          <div className="flex gap-2">
            <button 
              disabled={page === 0}
              onClick={() => setPage(p => Math.max(0, p - 1))}
              className="px-3 py-1 bg-surface-elevated border border-border-subtle rounded text-xs text-text-primary hover:bg-space-800 disabled:opacity-50 transition-colors"
            >
              Önceki
            </button>
            <button 
              disabled={!logsData?.data || page >= logsData.data.totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 bg-surface-elevated border border-border-subtle rounded text-xs text-text-primary hover:bg-space-800 disabled:opacity-50 transition-colors"
            >
              Sonraki
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
