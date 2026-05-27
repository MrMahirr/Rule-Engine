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
    <div className="flex-1 h-full overflow-y-auto bg-surface-primary p-8 flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2 mb-2">
          <Activity className="text-neon-blue" />
          Kural Motoru Analitikleri
        </h1>
        <p className="text-text-secondary text-sm">Sistemdeki kuralların anlık çalışma performansını ve istatistiklerini buradan izleyebilirsiniz.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-space-800 p-6 rounded-xl border border-border-subtle flex items-center gap-4">
          <div className="p-3 bg-space-700 rounded-lg text-text-primary"><Activity size={24} /></div>
          <div>
            <div className="text-sm text-text-secondary uppercase">Toplam Tetiklenme</div>
            <div className="text-2xl font-bold text-text-primary">{metrics?.totalEvaluations || 0}</div>
          </div>
        </div>
        <div className="bg-space-800 p-6 rounded-xl border border-border-subtle flex items-center gap-4">
          <div className="p-3 bg-neon-blue/10 rounded-lg text-neon-blue"><CheckCircle size={24} /></div>
          <div>
            <div className="text-sm text-text-secondary uppercase">Başarılı (Matched)</div>
            <div className="text-2xl font-bold text-text-primary">{metrics?.matchedEvaluations || 0}</div>
          </div>
        </div>
        <div className="bg-space-800 p-6 rounded-xl border border-border-subtle flex items-center gap-4">
          <div className="p-3 bg-red-400/10 rounded-lg text-red-400"><XCircle size={24} /></div>
          <div>
            <div className="text-sm text-text-secondary uppercase">Başarısız (Failed)</div>
            <div className="text-2xl font-bold text-text-primary">{metrics?.failedEvaluations || 0}</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[300px]">
        <div className="bg-space-800 p-6 rounded-xl border border-border-subtle flex flex-col">
          <h3 className="text-sm font-semibold text-text-secondary uppercase mb-4">Başarı Oranı</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-space-800 p-6 rounded-xl border border-border-subtle flex flex-col">
          <h3 className="text-sm font-semibold text-text-secondary uppercase mb-4">En Çok Tetiklenen Kurallar</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics?.topTriggeredRules || []} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="ruleName" stroke="#94a3b8" fontSize={12} width={100} />
                <Tooltip cursor={{ fill: '#334155' }} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }} />
                <Bar dataKey="triggerCount" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-space-800 rounded-xl border border-border-subtle overflow-hidden mt-4">
        <div className="p-6 border-b border-border-subtle flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-secondary uppercase flex items-center gap-2">
            <Clock size={16} />
            Son Çalışma Kayıtları (Audit Logs)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-space-900 border-b border-border-subtle text-xs uppercase text-text-muted">
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
                  <tr key={log.id} className="border-b border-border-subtle hover:bg-space-700/50 transition-colors">
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
        <div className="p-4 border-t border-border-subtle flex justify-between items-center bg-space-900">
          <span className="text-xs text-text-muted">
            Sayfa {logsData?.data?.number !== undefined ? logsData.data.number + 1 : 1} / {logsData?.data?.totalPages || 1}
          </span>
          <div className="flex gap-2">
            <button 
              disabled={page === 0}
              onClick={() => setPage(p => Math.max(0, p - 1))}
              className="px-3 py-1 bg-space-800 border border-border-subtle rounded text-xs text-text-primary hover:bg-space-700 disabled:opacity-50"
            >
              Önceki
            </button>
            <button 
              disabled={!logsData?.data || page >= logsData.data.totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 bg-space-800 border border-border-subtle rounded text-xs text-text-primary hover:bg-space-700 disabled:opacity-50"
            >
              Sonraki
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
