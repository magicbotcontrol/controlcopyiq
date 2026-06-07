import React, { Suspense, lazy, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  TrendingUp, 
  Coins, 
  Clock, 
  CheckCircle2,
  ListRestart
} from 'lucide-react';
import { UserCopy, Cobranca, Indicador, HistoricoBanca, SystemLog, UserAuth } from '../types';
import { ControlCopyDB, dateUtils } from '../lib/db';

interface DashboardProps {
  onNavigate: (tab: string) => void;
  auth: UserAuth;
}

const CampaignAuditPanel = lazy(() => import('./CampaignAuditPanel'));
const PerformanceHistoryCard = lazy(() => import('./dashboard/PerformanceHistoryCard'));
const OperationalAlertsPanel = lazy(() => import('./dashboard/OperationalAlertsPanel'));
const AuditLogPanel = lazy(() => import('./dashboard/AuditLogPanel'));

export default function Dashboard({ onNavigate, auth }: DashboardProps) {
  const [users, setUsers] = useState<UserCopy[]>([]);
  const [indicators, setIndicators] = useState<Indicador[]>([]);
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [histories, setHistories] = useState<HistoricoBanca[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [showCronResult, setShowCronResult] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [dbUsers, dbIndicators, dbCobrancas, dbHistoricos, dbLogs] = await Promise.all([
      ControlCopyDB.getUsers(),
      ControlCopyDB.getIndicators(),
      ControlCopyDB.getCobrancas(),
      ControlCopyDB.getHistoricos(),
      ControlCopyDB.getLogs(),
    ]);

    setUsers(dbUsers);
    setIndicators(dbIndicators);
    setCobrancas(dbCobrancas);
    setHistories(dbHistoricos);
    setLogs(dbLogs);
  };

  // Run Cron simulation
  const handleRunCron = async () => {
    const res = await ControlCopyDB.runDailyAutomations();
    await loadData();
    setShowCronResult(
      `Verificação diária executada com sucesso! ${res.updatedCharges} faturas vencidas marcadas como atrasadas e alertas de ciclos enviados.`
    );
    setTimeout(() => {
      setShowCronResult(null);
    }, 6000);
  };

  // Math metrics
  const activeUsersCount = users.filter(u => u.status === 'Ativo').length;
  const usersUnder1k = users.filter(u => u.banca_atual < 1000).length;
  const usersAbove1k = users.filter(u => u.banca_atual >= 1000).length;

  const totalReceivables = cobrancas
    .filter(c => c.status === 'Pendente' || c.status === 'Atrasado')
    .reduce((acc, curr) => acc + curr.valor_devido, 0);

  const totalCommissionsPaid = cobrancas
    .filter(c => c.status === 'Pago')
    .reduce((acc, curr) => acc + curr.valor_indicador, 0);

  const totalFirmRevenue = cobrancas
    .filter(c => c.status === 'Pago')
    .reduce((acc, curr) => acc + curr.valor_empresa, 0);

  // Today and Late issues count
  const todayStr = dateUtils.todayStr();
  const alertDueToday = users.filter(u => u.proxima_cobranca === todayStr);
  const lateCharges = cobrancas.filter(c => c.status === 'Atrasado');

  // Evolution monthly sum simulation for beautiful SVG plot
  // We can plot the profit history over previous balance updates
  const recentUpdates = [...histories]
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(-7);

  return (
    <div className="space-y-6 pb-20">
      {/* Top Welcome Title & Automation row */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">
            Resumos Operacionais
          </h1>
          <p className="text-sm text-zinc-500">
            Gestão inteligente de banca, indicadores de copy trading e repasses financeiros.
          </p>
        </div>
        
        {/* Quick run automation */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRunCron}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-950 hover:bg-zinc-900 text-white rounded-xl text-xs font-bold transition-all border border-zinc-800 shadow-sm"
          >
            <ListRestart className="w-4 h-4 text-[#FF5500]" />
            Simular Cron de Cobrança
          </button>
        </div>
      </div>

      {showCronResult && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl text-xs flex items-center gap-2"
        >
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0" />
          <span>{showCronResult}</span>
        </motion.div>
      )}

      {/* Grid of Main KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Users */}
        <div className="bg-white border border-zinc-150 rounded-2xl p-4 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="w-1.5 h-full bg-[#FF5500] absolute left-0 top-0" />
          <div className="flex items-center justify-between mb-3 pl-1">
            <span className="text-xs font-bold text-zinc-500 tracking-wide uppercase">Copy Ativos</span>
            <div className="p-2 rounded-xl bg-[#FF5500]/10 text-[#FF5500]">
              <Users className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="pl-1">
            <h3 className="text-2xl font-black tracking-tight text-zinc-900">{activeUsersCount}</h3>
            <div className="flex items-center gap-1.5 mt-2 text-[11px]">
              <span className="font-mono text-zinc-500">⚡ Ativo & Rodando</span>
            </div>
          </div>
        </div>

        {/* Card 2: Segregation Under / over 1k */}
        <div className="bg-white border border-zinc-150 rounded-2xl p-4 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="w-1.5 h-full bg-zinc-950 absolute left-0 top-0" />
          <div className="flex items-center justify-between mb-3 pl-1">
            <span className="text-xs font-bold text-zinc-500 tracking-wide uppercase">Segmentação</span>
            <div className="p-2 rounded-xl bg-zinc-100 text-zinc-700">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="pl-1">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-medium">Bancas &lt; $1k (Quinzenal):</span>
                <span className="text-xs font-extrabold text-[#FF5500] font-mono">{usersUnder1k}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-medium">Bancas &ge; $1k (Semanal):</span>
                <span className="text-xs font-extrabold text-zinc-950 font-mono">{usersAbove1k}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Receivables */}
        <div className="bg-white border border-zinc-150 rounded-2xl p-4 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="w-1.5 h-full bg-orange-600 absolute left-0 top-0" />
          <div className="flex items-center justify-between mb-3 pl-1">
            <span className="text-xs font-bold text-zinc-500 tracking-wide uppercase">Contas a Receber</span>
            <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
              <Clock className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="pl-1">
            <h3 className="text-2xl font-black tracking-tight text-zinc-900">${totalReceivables.toLocaleString('en-US', { minimumFractionDigits: 0 })}</h3>
            <p className="text-[10px] text-zinc-400 mt-2 font-mono">Faturas Pendentes/Atrasadas</p>
          </div>
        </div>

        {/* Card 4: Shared Revenue */}
        <div className="bg-white border border-zinc-150 rounded-2xl p-4 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="w-1.5 h-full bg-emerald-500 absolute left-0 top-0" />
          <div className="flex items-center justify-between mb-3 pl-1">
            <span className="text-xs font-bold text-zinc-500 tracking-wide uppercase">Receita Líquida</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Coins className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="pl-1">
            <h3 className="text-2xl font-black tracking-tight text-emerald-600">${totalFirmRevenue.toLocaleString('en-US', { minimumFractionDigits: 0 })}</h3>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[9px] text-zinc-500 font-mono font-bold">Repassado Indicadores:</span>
              <span className="text-[10px] text-orange-600 font-extrabold font-mono">${totalCommissionsPaid}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mid row: Charts and active alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Suspense
          fallback={
            <div className="bg-white border border-zinc-150 rounded-2xl p-5 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] lg:col-span-2">
              <div className="mb-4 space-y-2 border-b border-zinc-100 pb-3">
                <div className="h-4 w-48 animate-pulse rounded bg-zinc-100" />
                <div className="h-3 w-72 animate-pulse rounded bg-zinc-100" />
              </div>
              <div className="h-56 animate-pulse rounded-2xl bg-zinc-50" />
            </div>
          }
        >
          <PerformanceHistoryCard recentUpdates={recentUpdates} />
        </Suspense>

        <Suspense
          fallback={
            <div className="space-y-4">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                <div className="mb-4 h-4 w-40 animate-pulse rounded bg-zinc-800" />
                <div className="space-y-3">
                  <div className="h-24 animate-pulse rounded-xl bg-zinc-900" />
                  <div className="h-24 animate-pulse rounded-xl bg-zinc-900" />
                </div>
              </div>
              <div className="rounded-2xl border border-zinc-150 bg-white p-5">
                <div className="mb-3 h-4 w-32 animate-pulse rounded bg-zinc-100" />
                <div className="mb-4 h-3 w-56 animate-pulse rounded bg-zinc-100" />
                <div className="space-y-2">
                  <div className="h-11 animate-pulse rounded-xl bg-zinc-50" />
                  <div className="h-11 animate-pulse rounded-xl bg-zinc-50" />
                </div>
              </div>
            </div>
          }
        >
          <OperationalAlertsPanel
            alertDueToday={alertDueToday}
            lateCharges={lateCharges}
            users={users}
            onNavigate={onNavigate}
          />
        </Suspense>
      </div>

      {auth.level === 'Admin' && (
        <Suspense
          fallback={
            <div className="rounded-2xl border border-zinc-150 bg-white p-5 text-xs font-semibold text-zinc-500 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)]">
              Carregando painel administrativo de campanhas...
            </div>
          }
        >
          <CampaignAuditPanel auth={auth} />
        </Suspense>
      )}

      <Suspense
        fallback={
          <div className="rounded-2xl border border-zinc-150 bg-white p-5 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)]">
            <div className="mb-4 space-y-3">
              <div className="h-4 w-52 animate-pulse rounded bg-zinc-100" />
              <div className="h-3 w-72 animate-pulse rounded bg-zinc-100" />
              <div className="flex flex-wrap gap-2">
                <div className="h-9 w-20 animate-pulse rounded-full bg-zinc-100" />
                <div className="h-9 w-24 animate-pulse rounded-full bg-zinc-100" />
                <div className="h-9 w-24 animate-pulse rounded-full bg-zinc-100" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-11 animate-pulse rounded-xl bg-zinc-50" />
              <div className="h-11 animate-pulse rounded-xl bg-zinc-50" />
              <div className="h-11 animate-pulse rounded-xl bg-zinc-50" />
            </div>
          </div>
        }
      >
        <AuditLogPanel logs={logs} />
      </Suspense>
    </div>
  );
}
