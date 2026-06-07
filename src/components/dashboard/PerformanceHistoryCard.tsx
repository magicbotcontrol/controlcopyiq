import React from 'react';
import { HistoricoBanca } from '../../types';

interface PerformanceHistoryCardProps {
  recentUpdates: HistoricoBanca[];
}

export default function PerformanceHistoryCard({ recentUpdates }: PerformanceHistoryCardProps) {
  return (
    <div className="bg-white border border-zinc-150 rounded-2xl p-5 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] lg:col-span-2">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100">
        <div>
          <h3 className="font-bold text-sm tracking-tight text-zinc-900">Historico de Performance Recente</h3>
          <p className="text-[11px] text-zinc-400 font-mono">Ultimas 7 atualizacoes de banca faturadas com lucros / prejuizos</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#FF5500] inline-block" />
          <span className="text-[10px] text-zinc-500 font-mono">Lucro ($)</span>
        </div>
      </div>

      {recentUpdates.length > 0 ? (
        <div className="w-full h-56 mt-4 relative">
          <svg className="w-full h-full" viewBox="0 0 500 200">
            <defs>
              <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF5500" stopOpacity="0.3"></stop>
                <stop offset="100%" stopColor="#FF5500" stopOpacity="0.0"></stop>
              </linearGradient>
            </defs>

            <line x1="50" y1="20" x2="480" y2="20" stroke="#F1F1F5" strokeWidth="1" />
            <line x1="50" y1="70" x2="480" y2="70" stroke="#F1F1F5" strokeWidth="1" />
            <line x1="50" y1="120" x2="480" y2="120" stroke="#F1F1F5" strokeWidth="1" />
            <line x1="50" y1="170" x2="480" y2="170" stroke="#F1F1F5" strokeWidth="1" />

            {(() => {
              const paddingLeft = 50;
              const paddingRight = 30;
              const chartWidth = 500 - paddingLeft - paddingRight;
              const maxLucro = Math.max(...recentUpdates.map((update) => Math.abs(update.lucro)), 100);
              const pointDivisor = Math.max(1, recentUpdates.length - 1);

              const points = recentUpdates.map((update, index) => {
                const x = paddingLeft + (index / pointDivisor) * chartWidth;
                const profitScaled = (update.lucro / maxLucro) * 60;
                const y = 95 - profitScaled;

                return { x, y, lucro: update.lucro, date: update.created_at };
              });

              const pathD = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
              const areaD = `${pathD} L ${points[points.length - 1].x} 170 L ${points[0].x} 170 Z`;

              return (
                <>
                  <path d={areaD} fill="url(#gradient-area)" />
                  <path d={pathD} fill="none" stroke="#FF5500" strokeWidth="3" strokeLinecap="round" />

                  {points.map((point, index) => (
                    <g key={index} className="group cursor-pointer">
                      <circle cx={point.x} cy={point.y} r="5" fill="#FFFFFF" stroke="#FF5500" strokeWidth="3" />
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="10"
                        fill="#FF5500"
                        fillOpacity="0"
                        className="hover:fill-opacity-10 transition-all"
                      />

                      <text
                        x={point.x}
                        y={point.y - 12}
                        textAnchor="middle"
                        className="text-[10px] font-mono font-extrabold fill-zinc-900 bg-white"
                      >
                        {point.lucro > 0 ? `+$${point.lucro}` : `-$${Math.abs(point.lucro)}`}
                      </text>
                      <text x={point.x} y="190" textAnchor="middle" className="text-[8px] font-mono fill-zinc-400">
                        {point.date.substring(5)}
                      </text>
                    </g>
                  ))}
                </>
              );
            })()}
          </svg>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-zinc-400 text-xs">
          Nenhuma alteracao de banca registrada recentemente.
        </div>
      )}
    </div>
  );
}
