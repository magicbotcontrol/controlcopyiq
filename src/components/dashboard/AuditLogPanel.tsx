import React, { useMemo, useState } from 'react';
import { Activity } from 'lucide-react';
import { SystemLog } from '../../types';
import { dateUtils } from '../../lib/db';

type LogQuickFilter = 'todos' | 'auth' | 'rede' | 'perfil' | 'sessao_expirada';
type AuthLogCauseBadge = 'rede' | 'perfil' | 'credencial' | 'desconhecido';

const LOG_QUICK_FILTERS: Array<{
  id: LogQuickFilter;
  label: string;
  helper: string;
}> = [
  { id: 'todos', label: 'Todos', helper: 'Visao geral' },
  { id: 'auth', label: 'Auth', helper: 'Eventos de autenticacao' },
  { id: 'rede', label: 'Rede', helper: 'Falhas de conectividade' },
  { id: 'perfil', label: 'Perfil', helper: 'Inconsistencias em profiles' },
  { id: 'sessao_expirada', label: 'Sessao Expirada', helper: 'Tokens expirados ou invalidos' },
];

function isAuthLog(log: SystemLog) {
  return /auth/i.test(log.acao) || /restauracao_|sessao|credencial|perfil|falha_rede/i.test(log.detalhe);
}

function matchesLogQuickFilter(log: SystemLog, filter: LogQuickFilter) {
  const detail = log.detalhe.toLowerCase();

  if (filter === 'todos') {
    return true;
  }

  if (filter === 'auth') {
    return isAuthLog(log);
  }

  if (filter === 'rede') {
    return isAuthLog(log) && detail.includes('falha_rede');
  }

  if (filter === 'perfil') {
    return isAuthLog(log) && detail.includes('inconsistencia_perfil');
  }

  return isAuthLog(log) && (detail.includes('credencial_expirada') || detail.includes('sessao expirou'));
}

function getAuthLogCause(log: SystemLog): AuthLogCauseBadge | null {
  if (!isAuthLog(log)) {
    return null;
  }

  const detail = log.detalhe.toLowerCase();

  if (detail.includes('falha_rede')) {
    return 'rede';
  }

  if (detail.includes('inconsistencia_perfil')) {
    return 'perfil';
  }

  if (detail.includes('credencial_expirada') || detail.includes('sessao expirou')) {
    return 'credencial';
  }

  return 'desconhecido';
}

function getAuthBadgePresentation(cause: AuthLogCauseBadge) {
  if (cause === 'rede') {
    return {
      label: 'Rede',
      className: 'bg-sky-50 text-sky-700 border-sky-100',
      rowClassName: 'bg-sky-50/40',
    };
  }

  if (cause === 'perfil') {
    return {
      label: 'Perfil',
      className: 'bg-violet-50 text-violet-700 border-violet-100',
      rowClassName: 'bg-violet-50/40',
    };
  }

  if (cause === 'credencial') {
    return {
      label: 'Credencial',
      className: 'bg-amber-50 text-amber-700 border-amber-100',
      rowClassName: 'bg-amber-50/40',
    };
  }

  return {
    label: 'Auth',
    className: 'bg-zinc-100 text-zinc-700 border-zinc-200',
    rowClassName: 'bg-zinc-50/60',
  };
}

interface AuditLogPanelProps {
  logs: SystemLog[];
}

export default function AuditLogPanel({ logs }: AuditLogPanelProps) {
  const [logQuickFilter, setLogQuickFilter] = useState<LogQuickFilter>('todos');

  const filteredLogs = useMemo(
    () => logs.filter((log) => matchesLogQuickFilter(log, logQuickFilter)).slice(0, 8),
    [logs, logQuickFilter]
  );
  const authLogCount = useMemo(
    () => logs.filter((log) => matchesLogQuickFilter(log, 'auth')).length,
    [logs]
  );

  return (
    <div className="bg-white border border-zinc-150 rounded-2xl p-5 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)]">
      <div className="flex flex-col gap-4 mb-4">
        <div>
          <h3 className="font-bold text-sm text-zinc-900">Historico de Eventos & Auditoria Geral</h3>
          <p className="text-[11px] text-zinc-400 font-mono">
            Ultimas acoes e alertas do chatbot do Telegram despachados
          </p>
        </div>

        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {LOG_QUICK_FILTERS.map((filter) => {
              const isActive = logQuickFilter === filter.id;
              const count =
                filter.id === 'todos'
                  ? logs.length
                  : logs.filter((log) => matchesLogQuickFilter(log, filter.id)).length;

              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setLogQuickFilter(filter.id)}
                  className={`rounded-full border px-3 py-2 text-[11px] font-bold transition-colors ${
                    isActive
                      ? 'border-zinc-950 bg-zinc-950 text-white'
                      : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50'
                  }`}
                >
                  {filter.label} ({count})
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            {logQuickFilter === 'todos'
              ? `Em Tempo Real · ${authLogCount} evento(s) de auth`
              : LOG_QUICK_FILTERS.find((filter) => filter.id === logQuickFilter)?.helper}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-zinc-650 border-collapse">
          <thead>
            <tr className="border-b border-zinc-100 text-[10px] text-zinc-400 uppercase tracking-wider font-semibold font-mono bg-zinc-50/50">
              <th className="py-2.5 px-3">Data</th>
              <th className="py-2.5 px-3">Acao executada</th>
              <th className="py-2.5 px-3">Status / Detalhes</th>
              <th className="py-2.5 px-3">Operadora</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => {
              const authCause = getAuthLogCause(log);
              const authBadge = authCause ? getAuthBadgePresentation(authCause) : null;

              return (
                <tr
                  key={log.id}
                  className={`border-b border-zinc-50 transition-colors hover:bg-zinc-50/50 ${
                    authBadge ? authBadge.rowClassName : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-mono text-zinc-500">{dateUtils.formatBr(log.data)}</td>
                  <td className="py-2.5 px-3 font-semibold text-zinc-850">{log.acao}</td>
                  <td className="py-2.5 px-3">
                    <div className="flex flex-wrap items-start gap-2">
                      {authBadge && (
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide ${authBadge.className}`}
                        >
                          {authBadge.label}
                        </span>
                      )}
                      <span className="text-zinc-400 max-w-[250px] break-words">{log.detalhe}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-bold tracking-tight text-[10px]">
                      {log.user}
                    </span>
                  </td>
                </tr>
              );
            })}
            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 px-3 text-center text-xs text-zinc-400 font-medium">
                  Nenhum evento encontrado para o filtro selecionado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
