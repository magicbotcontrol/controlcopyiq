import React, { useEffect, useMemo, useState } from 'react';
import { Filter, Gift, RefreshCcw, ShieldCheck, TicketPercent } from 'lucide-react';
import {
  CampaignAuditFilters,
  CampaignAuditPageRequest,
  CopyTradingCampaignRedemption,
  InboundPartnerCampaign,
  UserAuth,
} from '../types';
import { ControlCopyDB } from '../lib/db';
import CampaignAuditTableSection from './campaign-audit/CampaignAuditTableSection';

interface CampaignAuditPanelProps {
  auth: UserAuth;
}

const EMPTY_FILTERS: CampaignAuditFilters = {
  partner: '',
  promoCode: '',
  startDate: '',
  endDate: '',
};

const DEFAULT_PAGE_SIZE = 25;
const INITIAL_PAGE_REQUEST: CampaignAuditPageRequest = {
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function serializeSourceQuery(sourceQuery: Record<string, unknown>) {
  const params = new URLSearchParams();

  Object.entries(sourceQuery ?? {}).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      return;
    }

    params.set(key, String(value));
  });

  return params.toString();
}

function normalizeFilters(filters: CampaignAuditFilters): CampaignAuditFilters {
  return {
    partner: filters.partner?.trim() || undefined,
    promoCode: filters.promoCode?.trim() || undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
  };
}

export default function CampaignAuditPanel({ auth }: CampaignAuditPanelProps) {
  const [draftFilters, setDraftFilters] = useState<CampaignAuditFilters>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<CampaignAuditFilters>(EMPTY_FILTERS);
  const [campaigns, setCampaigns] = useState<InboundPartnerCampaign[]>([]);
  const [redemptions, setRedemptions] = useState<CopyTradingCampaignRedemption[]>([]);
  const [campaignsTotal, setCampaignsTotal] = useState(0);
  const [redemptionsTotal, setRedemptionsTotal] = useState(0);
  const [campaignsPage, setCampaignsPage] = useState(INITIAL_PAGE_REQUEST.page ?? 1);
  const [redemptionsPage, setRedemptionsPage] = useState(INITIAL_PAGE_REQUEST.page ?? 1);
  const [campaignsHasNextPage, setCampaignsHasNextPage] = useState(false);
  const [redemptionsHasNextPage, setRedemptionsHasNextPage] = useState(false);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  const [isLoadingRedemptions, setIsLoadingRedemptions] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const promoOptions = useMemo(() => {
    const values = new Set<string>();

    campaigns.forEach((item) => {
      if (item.promo_code) {
        values.add(item.promo_code);
      }
    });

    redemptions.forEach((item) => {
      if (item.campaign_code) {
        values.add(item.campaign_code);
      }
    });

    return Array.from(values).sort();
  }, [campaigns, redemptions]);

  const partnerOptions = useMemo(() => {
    const values = new Set<string>();

    campaigns.forEach((item) => values.add(item.partner));
    redemptions.forEach((item) => values.add(item.partner));

    return Array.from(values).sort();
  }, [campaigns, redemptions]);

  useEffect(() => {
    if (auth.level !== 'Admin') {
      return;
    }

    const load = async () => {
      if (appliedFilters.startDate && appliedFilters.endDate && appliedFilters.startDate > appliedFilters.endDate) {
        setErrorMessage('O período informado é inválido. A data inicial não pode ser maior que a final.');
        return;
      }

      try {
        setIsLoadingCampaigns(true);
        setIsLoadingRedemptions(true);
        setErrorMessage(null);
        const normalizedFilters = normalizeFilters(appliedFilters);
        const [dbCampaigns, dbRedemptions] = await Promise.all([
          ControlCopyDB.getInboundPartnerCampaigns(normalizedFilters, {
            page: campaignsPage,
            pageSize: DEFAULT_PAGE_SIZE,
          }),
          ControlCopyDB.getCampaignRedemptions(normalizedFilters, {
            page: redemptionsPage,
            pageSize: DEFAULT_PAGE_SIZE,
          }),
        ]);

        setCampaigns(dbCampaigns.items);
        setCampaignsTotal(dbCampaigns.total);
        setCampaignsHasNextPage(dbCampaigns.hasNextPage);
        setRedemptions(dbRedemptions.items);
        setRedemptionsTotal(dbRedemptions.total);
        setRedemptionsHasNextPage(dbRedemptions.hasNextPage);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'Não foi possível carregar a auditoria de campanhas agora.'
        );
      } finally {
        setIsLoadingCampaigns(false);
        setIsLoadingRedemptions(false);
      }
    };

    void load();
  }, [appliedFilters, auth.level, campaignsPage, redemptionsPage]);

  if (auth.level !== 'Admin') {
    return null;
  }

  const handleApplyFilters = () => {
    setAppliedFilters(draftFilters);
    setCampaignsPage(1);
    setRedemptionsPage(1);
  };

  const handleResetFilters = () => {
    setDraftFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setCampaignsPage(1);
    setRedemptionsPage(1);
  };

  const latestInbound = campaigns[0]?.created_at ?? null;
  const latestRedemption = redemptions[0]?.applied_at ?? null;
  const isRefreshing = isLoadingCampaigns || isLoadingRedemptions;

  return (
    <section className="bg-white border border-zinc-150 rounded-2xl p-5 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] space-y-5">
      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-3">
        <div>
          <h3 className="font-bold text-sm text-zinc-900">Campanhas de Entrada & Benefícios</h3>
          <p className="text-[11px] text-zinc-400 font-mono">
            Observabilidade administrativa de `inbound_partner_campaigns` e `copy_trading_campaign_redemptions`.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-[11px] font-bold text-emerald-700">
          <ShieldCheck className="w-3.5 h-3.5" />
          Somente Admin visualiza este painel
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-3">
        <label className="space-y-1 xl:col-span-1">
          <span className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">Partner</span>
          <input
            list="campaign-partner-options"
            value={draftFilters.partner ?? ''}
            onChange={(e) => setDraftFilters((prev) => ({ ...prev, partner: e.target.value }))}
            placeholder="Ex: magiccopybot"
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-800 outline-none focus:border-[#FF5500]"
          />
          <datalist id="campaign-partner-options">
            {partnerOptions.map((partner) => (
              <option key={partner} value={partner} />
            ))}
          </datalist>
        </label>

        <label className="space-y-1 xl:col-span-1">
          <span className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">Promo Code</span>
          <input
            list="campaign-promo-options"
            value={draftFilters.promoCode ?? ''}
            onChange={(e) => setDraftFilters((prev) => ({ ...prev, promoCode: e.target.value.toUpperCase() }))}
            placeholder="Ex: COPY7"
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-800 outline-none focus:border-[#FF5500]"
          />
          <datalist id="campaign-promo-options">
            {promoOptions.map((promo) => (
              <option key={promo} value={promo} />
            ))}
          </datalist>
        </label>

        <label className="space-y-1 xl:col-span-1">
          <span className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">Data Inicial</span>
          <input
            type="date"
            value={draftFilters.startDate ?? ''}
            onChange={(e) => setDraftFilters((prev) => ({ ...prev, startDate: e.target.value }))}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-800 outline-none focus:border-[#FF5500]"
          />
        </label>

        <label className="space-y-1 xl:col-span-1">
          <span className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">Data Final</span>
          <input
            type="date"
            value={draftFilters.endDate ?? ''}
            onChange={(e) => setDraftFilters((prev) => ({ ...prev, endDate: e.target.value }))}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-800 outline-none focus:border-[#FF5500]"
          />
        </label>

        <div className="flex items-end gap-2 xl:justify-end">
          <button
            type="button"
            onClick={handleApplyFilters}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-zinc-900"
          >
            <Filter className="w-3.5 h-3.5 text-[#FF5500]" />
            Aplicar
          </button>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-600 transition-colors hover:bg-zinc-50"
          >
            Limpar
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-zinc-150 bg-zinc-50 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">Entradas Capturadas</span>
            <Gift className="w-4 h-4 text-[#FF5500]" />
          </div>
          <p className="mt-2 text-2xl font-black tracking-tight text-zinc-900">{campaignsTotal}</p>
          <p className="mt-1 text-[11px] text-zinc-500">
            {latestInbound ? `Última captura em ${formatDateTime(latestInbound)}` : 'Sem campanhas no filtro atual.'}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-150 bg-zinc-50 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">Redemptions Aplicadas</span>
            <TicketPercent className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-black tracking-tight text-zinc-900">{redemptionsTotal}</p>
          <p className="mt-1 text-[11px] text-zinc-500">
            {latestRedemption
              ? `Último benefício em ${formatDateTime(latestRedemption)}`
              : 'Sem benefícios no filtro atual.'}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-150 bg-zinc-50 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">Atualização</span>
            <RefreshCcw className={`w-4 h-4 text-zinc-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          </div>
          <p className="mt-2 text-sm font-black tracking-tight text-zinc-900">
            {isRefreshing ? 'Carregando auditoria...' : 'Painel sincronizado'}
          </p>
          <button
            type="button"
            onClick={handleApplyFilters}
            className="mt-2 text-[11px] font-bold text-[#FF5500] hover:text-[#FF4500]"
          >
            Atualizar agora
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-5">
        <CampaignAuditTableSection
          title="Inbound Partner Campaigns"
          description="Primeiro contato capturado no cadastro público."
          total={campaignsTotal}
          page={campaignsPage}
          pageSize={DEFAULT_PAGE_SIZE}
          isLoading={isLoadingCampaigns}
          hasNextPage={campaignsHasNextPage}
          isEmpty={campaigns.length === 0}
          emptyMessage="Nenhuma entrada encontrada para o filtro atual."
          onPreviousPage={() => setCampaignsPage((currentPage) => Math.max(1, currentPage - 1))}
          onNextPage={() => setCampaignsPage((currentPage) => currentPage + 1)}
        >
          <div className="overflow-x-auto rounded-2xl border border-zinc-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-[10px] uppercase tracking-wide text-zinc-400 font-bold">
                <tr>
                  <th className="px-3 py-2.5">Quando</th>
                  <th className="px-3 py-2.5">Cliente</th>
                  <th className="px-3 py-2.5">Origem</th>
                  <th className="px-3 py-2.5">Promo</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => {
                  const queryString = serializeSourceQuery(campaign.source_query);
                  const sourceLabel = queryString
                    ? `${campaign.source_path}?${queryString}`
                    : campaign.source_path;

                  return (
                    <tr key={campaign.id} className="border-t border-zinc-100 align-top">
                      <td className="px-3 py-3 font-mono text-zinc-500 whitespace-nowrap">
                        {formatDateTime(campaign.created_at)}
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-semibold text-zinc-900">{campaign.email || 'Sem e-mail'}</div>
                        <div className="text-[11px] text-zinc-500">
                          Indicador: {campaign.indicator_code || 'Não informado'}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="inline-flex rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-bold text-zinc-700">
                          {campaign.partner}
                        </div>
                        <div className="mt-1 max-w-[240px] break-words text-[11px] text-zinc-500">{sourceLabel}</div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="inline-flex rounded-full border border-amber-100 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                          {campaign.promo_code || 'Sem promo'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {!isLoadingCampaigns && campaigns.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-xs font-medium text-zinc-400">
                      Nenhuma entrada encontrada para o filtro atual.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CampaignAuditTableSection>

        <CampaignAuditTableSection
          title="Copy Trading Campaign Redemptions"
          description="Benefícios aplicados ao primeiro cadastro autenticado."
          total={redemptionsTotal}
          page={redemptionsPage}
          pageSize={DEFAULT_PAGE_SIZE}
          isLoading={isLoadingRedemptions}
          hasNextPage={redemptionsHasNextPage}
          isEmpty={redemptions.length === 0}
          emptyMessage="Nenhum benefício aplicado para o filtro atual."
          onPreviousPage={() => setRedemptionsPage((currentPage) => Math.max(1, currentPage - 1))}
          onNextPage={() => setRedemptionsPage((currentPage) => currentPage + 1)}
        >
          <div className="overflow-x-auto rounded-2xl border border-zinc-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-[10px] uppercase tracking-wide text-zinc-400 font-bold">
                <tr>
                  <th className="px-3 py-2.5">Quando</th>
                  <th className="px-3 py-2.5">Campanha</th>
                  <th className="px-3 py-2.5">Trial</th>
                  <th className="px-3 py-2.5">Expira</th>
                </tr>
              </thead>
              <tbody>
                {redemptions.map((redemption) => (
                  <tr key={redemption.id} className="border-t border-zinc-100 align-top">
                    <td className="px-3 py-3 font-mono text-zinc-500 whitespace-nowrap">
                      {formatDateTime(redemption.applied_at)}
                    </td>
                    <td className="px-3 py-3">
                      <div className="inline-flex rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-bold text-zinc-700">
                        {redemption.partner}
                      </div>
                      <div className="mt-1 font-semibold text-zinc-900">{redemption.campaign_code}</div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="font-black text-emerald-600">{redemption.trial_days} dias</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-semibold text-zinc-900">{formatDateTime(redemption.entitlement_expires_at)}</div>
                      <div className="text-[11px] text-zinc-500">
                        Usuário: {redemption.auth_user_id.slice(0, 8)}...
                      </div>
                    </td>
                  </tr>
                ))}
                {!isLoadingRedemptions && redemptions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-xs font-medium text-zinc-400">
                      Nenhum benefício aplicado para o filtro atual.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CampaignAuditTableSection>
      </div>
    </section>
  );
}
