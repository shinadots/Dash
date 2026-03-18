/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  DollarSign, 
  MousePointer2, 
  Target, 
  Plus, 
  Trash2, 
  LogOut, 
  LogIn, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, googleProvider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { 
  subscribeToMetrics, 
  subscribeToGoogleAccounts, 
  addMetric, 
  addGoogleAccount, 
  deleteGoogleAccount 
} from './services/firebaseService';
import { PerformanceMetric, GoogleAccount } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-[#1a162d] border border-white/5 rounded-2xl p-6 shadow-xl", className)}>
    {children}
  </div>
);

const StatCard = ({ title, value, icon: Icon, trend, trendValue }: { 
  title: string; 
  value: string | number; 
  icon: any; 
  trend?: 'up' | 'down'; 
  trendValue?: string 
}) => (
  <Card className="flex flex-col gap-4">
    <div className="flex justify-between items-start">
      <div className="p-3 bg-white/5 rounded-xl">
        <Icon className="w-6 h-6 text-indigo-400" />
      </div>
      {trend && (
        <div className={cn(
          "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
          trend === 'up' ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
        )}>
          {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trendValue}
        </div>
      )}
    </div>
    <div>
      <p className="text-white/50 text-sm font-medium uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
    </div>
  </Card>
);

const TabButton = ({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: any; label: string }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 font-medium",
      active 
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
        : "text-white/50 hover:text-white hover:bg-white/5"
    )}
  >
    <Icon className="w-5 h-5" />
    {label}
  </button>
);

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'accounts'>('dashboard');
  const [platformFilter, setPlatformFilter] = useState<'all' | 'meta' | 'google'>('all');
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [accounts, setAccounts] = useState<GoogleAccount[]>([]);
  const [isAddingMetric, setIsAddingMetric] = useState(false);
  const [isAddingAccount, setIsAddingAccount] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubMetrics = subscribeToMetrics(user.uid, setMetrics);
    const unsubAccounts = subscribeToGoogleAccounts(user.uid, setAccounts);
    return () => {
      unsubMetrics();
      unsubAccounts();
    };
  }, [user]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const filteredMetrics = useMemo(() => {
    if (platformFilter === 'all') return metrics;
    return metrics.filter(m => m.platform === platformFilter);
  }, [metrics, platformFilter]);

  const stats = useMemo(() => {
    const totalSpend = filteredMetrics.reduce((acc, m) => acc + m.spend, 0);
    const totalImpressions = filteredMetrics.reduce((acc, m) => acc + m.impressions, 0);
    const totalClicks = filteredMetrics.reduce((acc, m) => acc + m.clicks, 0);
    const totalConversions = filteredMetrics.reduce((acc, m) => acc + m.conversions, 0);
    return { totalSpend, totalImpressions, totalClicks, totalConversions };
  }, [filteredMetrics]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a051a] flex items-center justify-center">
        <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a051a] flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-[#1a162d] border border-white/5 rounded-3xl p-10 shadow-2xl"
        >
          <div className="w-20 h-20 bg-indigo-600/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <LayoutDashboard className="w-10 h-10 text-indigo-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Dashboard de Performance</h1>
          <p className="text-white/60 mb-10 leading-relaxed">
            Gerencie suas campanhas de Meta Ads e contas do Google em um só lugar com dados em tempo real.
          </p>
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white text-black font-bold py-4 rounded-2xl hover:bg-white/90 transition-all duration-300"
          >
            <LogIn className="w-5 h-5" />
            Entrar com Google
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a051a] text-white font-sans selection:bg-indigo-500/30">
      {/* Sidebar / Header */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-[#0a051a]/80 backdrop-blur-xl border-b border-white/5 z-50 px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Performance Hub</h1>
        </div>

        <nav className="flex items-center gap-2 bg-white/5 p-1 rounded-full border border-white/5">
          <TabButton 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
            icon={TrendingUp} 
            label="Dashboard" 
          />
          <TabButton 
            active={activeTab === 'accounts'} 
            onClick={() => setActiveTab('accounts')} 
            icon={Users} 
            label="Contas Google" 
          />
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <p className="text-sm font-medium">{user.displayName}</p>
            <p className="text-xs text-white/40">{user.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-3 bg-white/5 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-20 px-8 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              {/* Stats Grid */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
                  <button 
                    onClick={() => setPlatformFilter('all')}
                    className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", platformFilter === 'all' ? "bg-indigo-600 text-white" : "text-white/40 hover:text-white")}
                  >
                    Todos
                  </button>
                  <button 
                    onClick={() => setPlatformFilter('meta')}
                    className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", platformFilter === 'meta' ? "bg-indigo-600 text-white" : "text-white/40 hover:text-white")}
                  >
                    Meta Ads
                  </button>
                  <button 
                    onClick={() => setPlatformFilter('google')}
                    className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", platformFilter === 'google' ? "bg-indigo-600 text-white" : "text-white/40 hover:text-white")}
                  >
                    Google Ads
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Investimento Total" value={`R$ ${stats.totalSpend.toLocaleString()}`} icon={DollarSign} trend="up" trendValue="12%" />
                <StatCard title="Impressões" value={stats.totalImpressions.toLocaleString()} icon={TrendingUp} trend="up" trendValue="8%" />
                <StatCard title="Cliques" value={stats.totalClicks.toLocaleString()} icon={MousePointer2} trend="down" trendValue="3%" />
                <StatCard title="Conversões" value={stats.totalConversions.toLocaleString()} icon={Target} trend="up" trendValue="24%" />
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="h-[400px]">
                  <h3 className="text-lg font-bold mb-6">Performance por Campanha</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredMetrics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="campaignName" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1a162d', border: '1px solid #ffffff10', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="spend" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="h-[400px]">
                  <h3 className="text-lg font-bold mb-6">Tendência de Conversão</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={filteredMetrics}>
                      <defs>
                        <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="date" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1a162d', border: '1px solid #ffffff10', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="conversions" stroke="#6366f1" fillOpacity={1} fill="url(#colorConv)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>
              </div>

              {/* Campaign Table */}
              <Card>
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold">Campanhas Ativas</h3>
                  <button 
                    onClick={() => setIsAddingMetric(true)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl transition-all duration-300 text-sm font-bold"
                  >
                    <Plus className="w-4 h-4" />
                    Nova Métrica
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-white/40 text-xs uppercase tracking-widest border-b border-white/5">
                        <th className="pb-4 font-medium">Campanha</th>
                        <th className="pb-4 font-medium">Investimento</th>
                        <th className="pb-4 font-medium">CTR</th>
                        <th className="pb-4 font-medium">CPC</th>
                        <th className="pb-4 font-medium">ROAS</th>
                        <th className="pb-4 font-medium">Data</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredMetrics.map((m) => (
                        <tr key={m.id} className="group hover:bg-white/5 transition-colors">
                          <td className="py-4 font-medium">
                            <div className="flex flex-col">
                              <span>{m.campaignName}</span>
                              <span className={cn(
                                "text-[10px] uppercase font-bold tracking-tighter",
                                m.platform === 'meta' ? "text-blue-400" : "text-orange-400"
                              )}>
                                {m.platform}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 text-indigo-400 font-bold">R$ {m.spend.toLocaleString()}</td>
                          <td className="py-4">{m.ctr}%</td>
                          <td className="py-4">R$ {m.cpc}</td>
                          <td className="py-4 text-emerald-400 font-bold">{m.roas}x</td>
                          <td className="py-4 text-white/40 text-sm">{m.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="accounts"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Contas Google</h2>
                  <p className="text-white/50">Gerencie suas conexões com Google Ads, Analytics e Search Console.</p>
                </div>
                <button 
                  onClick={() => setIsAddingAccount(true)}
                  className="flex items-center gap-2 bg-white text-black hover:bg-white/90 px-6 py-3 rounded-2xl transition-all duration-300 font-bold"
                >
                  <Plus className="w-5 h-5" />
                  Conectar Conta
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts.map((acc) => (
                  <Card key={acc.id} className="relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => deleteGoogleAccount(acc.id)}
                        className="p-2 bg-rose-500/20 text-rose-400 rounded-lg hover:bg-rose-500 hover:text-white transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center",
                        acc.type === 'Ads' ? "bg-blue-500/20 text-blue-400" :
                        acc.type === 'Analytics' ? "bg-orange-500/20 text-orange-400" :
                        "bg-emerald-500/20 text-emerald-400"
                      )}>
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold">{acc.name}</h4>
                        <p className="text-xs text-white/40">{acc.type}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-white/40">Email</span>
                        <span className="font-medium">{acc.email}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-white/40">Status</span>
                        <div className="flex items-center gap-1.5">
                          {acc.status === 'active' ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span className="text-emerald-400 font-medium">Ativo</span>
                            </>
                          ) : acc.status === 'error' ? (
                            <>
                              <XCircle className="w-4 h-4 text-rose-400" />
                              <span className="text-rose-400 font-medium">Erro</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-4 h-4 text-amber-400" />
                              <span className="text-amber-400 font-medium">Inativo</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="pt-4 border-t border-white/5 flex justify-between items-center text-xs text-white/30">
                        <span>Última Sincronização</span>
                        <span>{new Date(acc.lastSync).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modals */}
      {isAddingMetric && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <Card className="max-w-md w-full">
            <h3 className="text-xl font-bold mb-6">Adicionar Métrica</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              addMetric({
                platform: formData.get('platform') as 'meta' | 'google',
                campaignName: formData.get('campaign') as string,
                spend: Number(formData.get('spend')),
                impressions: Number(formData.get('impressions')),
                clicks: Number(formData.get('clicks')),
                conversions: Number(formData.get('conversions')),
                ctr: Number(formData.get('ctr')),
                cpc: Number(formData.get('cpc')),
                roas: Number(formData.get('roas')),
                date: new Date().toISOString().split('T')[0],
                uid: user.uid
              });
              setIsAddingMetric(false);
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <select name="platform" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white/60" required>
                  <option value="meta">Meta Ads</option>
                  <option value="google">Google Ads</option>
                </select>
                <input name="campaign" placeholder="Nome da Campanha" className="w-full bg-white/5 border border-white/10 rounded-xl p-3" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input name="spend" type="number" placeholder="Gasto (R$)" className="bg-white/5 border border-white/10 rounded-xl p-3" required />
                <input name="roas" type="number" step="0.1" placeholder="ROAS" className="bg-white/5 border border-white/10 rounded-xl p-3" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input name="impressions" type="number" placeholder="Impressões" className="bg-white/5 border border-white/10 rounded-xl p-3" />
                <input name="clicks" type="number" placeholder="Cliques" className="bg-white/5 border border-white/10 rounded-xl p-3" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsAddingMetric(false)} className="flex-1 py-3 rounded-xl border border-white/10 font-bold">Cancelar</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-indigo-600 font-bold">Salvar</button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {isAddingAccount && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <Card className="max-w-md w-full">
            <h3 className="text-xl font-bold mb-6">Conectar Conta Google</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              addGoogleAccount({
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                type: formData.get('type') as any,
                status: 'active',
                uid: user.uid
              });
              setIsAddingAccount(false);
            }} className="space-y-4">
              <input name="name" placeholder="Nome da Conta" className="w-full bg-white/5 border border-white/10 rounded-xl p-3" required />
              <input name="email" type="email" placeholder="Email Google" className="w-full bg-white/5 border border-white/10 rounded-xl p-3" required />
              <select name="type" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white/60">
                <option value="Ads">Google Ads</option>
                <option value="Analytics">Google Analytics</option>
                <option value="Search Console">Search Console</option>
              </select>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsAddingAccount(false)} className="flex-1 py-3 rounded-xl border border-white/10 font-bold">Cancelar</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-white text-black font-bold">Conectar</button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
