import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Cobranca, UserCopy } from '../../types';

interface OperationalAlertsPanelProps {
  alertDueToday: UserCopy[];
  lateCharges: Cobranca[];
  users: UserCopy[];
  onNavigate: (tab: string) => void;
}

export default function OperationalAlertsPanel({
  alertDueToday,
  lateCharges,
  users,
  onNavigate,
}: OperationalAlertsPanelProps) {
  return (
    <div className="space-y-4">
      <div className="bg-zinc-950 text-white rounded-2xl p-5 border border-zinc-800 shadow-md">
        <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-1.5 mb-3.5">
          <AlertTriangle className="w-4.5 h-4.5 text-[#FF5500]" />
          Painel de Alertas Rapidos
        </h3>

        <div className="space-y-2 text-xs">
          <div className="p-3 bg-zinc-900 border border-zinc-805 rounded-xl flex flex-col gap-1.5 justify-start">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-400">Ciclos de Ativos Vencendo Hoje:</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  alertDueToday.length > 0 ? 'bg-[#FF5500]/20 text-[#FF5500]' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {alertDueToday.length}
              </span>
            </div>
            {alertDueToday.length > 0 ? (
              <div className="space-y-1 mt-1 border-t border-zinc-800/50 pt-1.5">
                {alertDueToday.map((user) => (
                  <div key={user.id} className="flex items-center justify-between text-[11px] text-zinc-300">
                    <span className="truncate max-w-[120px]">● {user.nome}</span>
                    <span className="font-mono text-[#FF5500] font-bold">ID IQ: {user.iq_id}</span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-[10px] text-zinc-500 italic">Evolucao e cobrancas estaveis para hoje.</span>
            )}
          </div>

          <div className="p-3 bg-zinc-900 border border-zinc-805 rounded-xl flex flex-col gap-1.5 justify-start">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-400">Cobrancas Atuais em Atraso:</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  lateCharges.length > 0
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {lateCharges.length}
              </span>
            </div>
            {lateCharges.length > 0 ? (
              <div className="space-y-1.5 mt-1 border-t border-zinc-800/50 pt-1.5">
                {lateCharges.map((charge) => {
                  const user = users.find((item) => item.id === charge.user_id);

                  return (
                    <div key={charge.id} className="flex items-center justify-between text-[11px] text-zinc-300">
                      <span className="truncate max-w-[120px] text-red-300">⚠ {user?.nome || 'Cliente'}</span>
                      <span className="font-mono text-zinc-200 font-bold">${charge.valor_devido}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <span className="text-[10px] text-zinc-500 italic">Nenhum repasse de cliente em atraso.</span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-zinc-150 rounded-2xl p-5 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)]">
        <h3 className="font-bold text-sm text-zinc-900 mb-2">Setup Operacional</h3>
        <p className="text-xs text-zinc-400 mb-4 font-mono">
          Como novos integrados de copy trading se comportam na grade empresarial.
        </p>

        <div className="space-y-2.5">
          <button
            onClick={() => onNavigate('links')}
            className="w-full flex items-center justify-between text-xs font-semibold p-3 hover:bg-zinc-55 hover:bg-zinc-50 border border-zinc-100 rounded-xl text-zinc-800 transition-colors"
          >
            <span>🚀 Ativar Novo Copy / Enviar Links</span>
            <span className="text-zinc-400">&rarr;</span>
          </button>
          <button
            onClick={() => onNavigate('users')}
            className="w-full flex items-center justify-between text-xs font-semibold p-3 hover:bg-zinc-55 hover:bg-zinc-50 border border-zinc-100 rounded-xl text-zinc-800 transition-colors"
          >
            <span>📊 Lancar Novo Saldo em Lote</span>
            <span className="text-[#FF5500]">&rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
}
