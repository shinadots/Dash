import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';
import { 
  LayoutDashboard, Users, TrendingUp, DollarSign, MousePointer2, Target, 
  RefreshCw, Filter, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
// Removemos as importações de Auth
import { subscribeToMetrics, subscribeToGoogleAccounts } from './services/firebaseService';
import { PerformanceMetric, GoogleAccount } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Componentes de UI ---
const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-[#1a162d] border border-white/5 rounded-2xl p-6 shadow-xl", className)}>
    {children}
  </div>
);

const StatCard = ({ title, value, icon: Icon }: { title: string; value: string | number; icon: any }) => (
  <Card className="flex flex-col gap-4">
    <div className="flex justify-between items-start">
      <div className="p-3 bg-white/5 rounded-xl">
        <Icon className="w-6 h-6 text-indigo-400" />
      </div>
    </div>
    <div>
      <p className="text-white/50 text-sm font-medium uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
    </div>
  </Card>
);

export default function App() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  
  // --- Novos Estados de Filtro ---
  const [platformFilter, setPlatformFilter] = useState<'all' | 'meta' | 'google'>('all');
  const [squadFilter, setSquadFilter] = useState('all');
  const [gestorFilter, setGestorFilter] = useState('all');

  // Busca os dados (Passamos um ID vazio ou fixo, já que não há mais login)
  useEffect(() => {
    const unsubMetrics = subscribeToMetrics("public_data", (data) => {
      setMetrics(data);
      setLoading(false);
    });
    return () => unsubMetrics();
  }, []);

  // --- Lógica de Filtros Dinâmicos ---
  const squads = useMemo(() => ["all", ...new Set(metrics.map(m => m.squad).filter(Boolean))], [metrics]);
  const gestores = useMemo(() => ["all", ...new Set(metrics.map(m => m.gestor).filter(Boolean))], [metrics]);

  const filteredMetrics = useMemo(() => {
    return metrics.filter(m => {
      const matchPlatform = platformFilter === 'all' || m.platform.toLowerCase() === platformFilter;
      const matchSquad = squadFilter === 'all' || m.squad === squadFilter;
      const matchGestor = gestorFilter === 'all' || m.gestor === gestorFilter;
      return matchPlatform && matchSquad && matchGestor;
    });
  }, [metrics, platformFilter, squadFilter, gestorFilter]);

  const stats = useMemo(() => {
    const totalSpend = filteredMetrics.reduce((acc, m) => acc + (m.spend || 0), 0);
    const totalClicks = filteredMetrics.reduce((acc, m) => acc + (m.clicks || 0), 0);
    const totalConversions = filteredMetrics.reduce((acc, m) => acc + (m.conversions || 0), 0);
    const cpa = totalConversions > 0 ? totalSpend / totalConversions : 0;
    return { totalSpend, totalClicks, totalConversions, cpa };
  }, [filteredMetrics]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a051a] flex items-center justify-center">
        <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a051a] text-white font-sans">
      {/* Header Fixo */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-[#0a051a]/80 backdrop-blur-xl border-b border-white/5 z-50 px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Performance Dash</h1>
        </div>

        {/* Filtros no Header */}
        <div className="flex gap-3">
          <select 
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none"
            onChange={(e) => setSquadFilter(e.target.value)}
          >
            <option value="all">Todos os Squads</option>
            {squads.filter(s => s !== 'all').map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select 
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none"
            onChange={(e) => setGestorFilter(e.target.value)}
          >
            <option value="all">Todos os Gestores</option>
            {gestores.filter(g => g !== 'all').map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </header>

      <main className="pt-32 pb-20 px-8 max-w-7xl mx-auto space-y-8">
        {/* Seletor de Plataforma */}
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5 w-fit">
          {['all', 'meta', 'google'].map((p) => (
            <button 
              key={p}
              onClick={() => setPlatformFilter(p as any)}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-bold transition-all capitalize",
                platformFilter === p ? "bg-indigo-600 text-white" : "text-white/40 hover:text-white"
              )}
            >
              {p === 'all' ? 'Geral' : p}
            </button>
          ))}
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Investimento" value={`R$ ${stats.totalSpend.toLocaleString('pt-BR')}`} icon={DollarSign} />
          <StatCard title="Cliques" value={stats.totalClicks.toLocaleString()} icon={MousePointer2} />
          <StatCard title="Conversões" value={stats.totalConversions.toLocaleString()} icon={Target} />
          <StatCard title="CPA Médio" value={`R$ ${stats.cpa.toFixed(2)}`} icon={TrendingUp} />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="h-[400px]">
            <h3 className="text-lg font-bold mb-6">Investimento por Campanha</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredMetrics.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="campaignName" stroke="#ffffff40" fontSize={10} tickLine={false} />
                <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1a162d', border: 'none', borderRadius: '12px' }} />
                <Bar dataKey="spend" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="h-[400px]">
            <h3 className="text-lg font-bold mb-6">Tendência de Conversões</h3>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredMetrics}>
                <defs>
                  <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#ffffff40" fontSize={12} />
                <YAxis stroke="#ffffff40" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1a162d', border: 'none' }} />
                <Area type="monotone" dataKey="conversions" stroke="#6366f1" fill="url(#colorConv)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Tabela Detalhada */}
        <Card>
          <h3 className="text-xl font-bold mb-6">Detalhamento das Contas</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-white/40 text-xs uppercase border-b border-white/5">
                  <th className="pb-4">Plataforma</th>
                  <th className="pb-4">Campanha / Conta</th>
                  <th className="pb-4">Squad</th>
                  <th className="pb-4">Gestor</th>
                  <th className="pb-4">Investimento</th>
                  <th className="pb-4">Conversões</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredMetrics.map((m, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="py-4">
                      <span className={cn(
                        "px-2 py-1 rounded text-[10px] font-bold uppercase",
                        m.platform === 'meta' ? "bg-blue-500/20 text-blue-400" : "bg-orange-500/20 text-orange-400"
                      )}>{m.platform}</span>
                    </td>
                    <td className="py-4 font-medium">{m.campaignName}</td>
                    <td className="py-4 text-white/60">{m.squad || '-'}</td>
                    <td className="py-4 text-white/60">{m.gestor || '-'}</td>
                    <td className="py-4 text-indigo-400 font-bold">R$ {m.spend?.toLocaleString()}</td>
                    <td className="py-4">{m.conversions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}
