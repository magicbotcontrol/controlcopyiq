import React from 'react';
import { ChevronLeft, ChevronRight, LoaderCircle } from 'lucide-react';

interface CampaignAuditTableSectionProps {
  title: string;
  description: string;
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  hasNextPage: boolean;
  isEmpty: boolean;
  emptyMessage: string;
  onPreviousPage: () => void;
  onNextPage: () => void;
  children: React.ReactNode;
}

export default function CampaignAuditTableSection({
  title,
  description,
  total,
  page,
  pageSize,
  isLoading,
  hasNextPage,
  isEmpty,
  emptyMessage,
  onPreviousPage,
  onNextPage,
  children,
}: CampaignAuditTableSectionProps) {
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h4 className="font-bold text-sm text-zinc-900">{title}</h4>
          <p className="text-[11px] text-zinc-400 font-mono">{description}</p>
        </div>

        <div className="flex items-center gap-2 self-start rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-[11px] font-bold text-zinc-600">
          {isLoading && <LoaderCircle className="h-3.5 w-3.5 animate-spin text-[#FF5500]" />}
          <span>{`Total: ${total}`}</span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-zinc-100">{children}</div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] font-medium text-zinc-500">
          {isEmpty ? emptyMessage : `Exibindo ${startItem}-${endItem} de ${total} registro(s).`}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPreviousPage}
            disabled={page <= 1 || isLoading}
            className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-[11px] font-bold text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Anterior
          </button>

          <span className="min-w-[72px] text-center text-[11px] font-bold text-zinc-500">{`Página ${page}`}</span>

          <button
            type="button"
            onClick={onNextPage}
            disabled={!hasNextPage || isLoading}
            className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-[11px] font-bold text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Próxima
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
