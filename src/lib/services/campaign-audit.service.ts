import {
  CampaignAuditFilters,
  CampaignAuditPageRequest,
  CopyTradingCampaignRedemption,
  InboundPartnerCampaign,
  PaginatedResult,
} from '../../types';
import { supabase } from '../supabase';
import { assertNoError } from './shared';

function applyDateFilters<T extends { gte: Function; lte: Function }>(
  query: T,
  column: string,
  filters: CampaignAuditFilters
) {
  let nextQuery = query;

  if (filters.startDate) {
    nextQuery = nextQuery.gte(column, `${filters.startDate}T00:00:00.000Z`);
  }

  if (filters.endDate) {
    nextQuery = nextQuery.lte(column, `${filters.endDate}T23:59:59.999Z`);
  }

  return nextQuery;
}

function normalizePagination(pageRequest: CampaignAuditPageRequest = {}) {
  const pageSize = Math.max(1, pageRequest.pageSize ?? 25);
  const page = Math.max(1, pageRequest.page ?? 1);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return { page, pageSize, from, to };
}

export async function getInboundPartnerCampaigns(
  filters: CampaignAuditFilters = {},
  pageRequest: CampaignAuditPageRequest = {}
): Promise<PaginatedResult<InboundPartnerCampaign>> {
  const { page, pageSize, from, to } = normalizePagination(pageRequest);
  let query = supabase
    .from('inbound_partner_campaigns')
    .select('id, auth_user_id, partner, promo_code, email, indicator_code, source_path, source_query, created_at', {
      count: 'exact',
    })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (filters.partner) {
    query = query.eq('partner', filters.partner.toLowerCase().trim());
  }

  if (filters.promoCode) {
    query = query.eq('promo_code', filters.promoCode.toUpperCase().trim());
  }

  query = applyDateFilters(query, 'created_at', filters);

  const { data, error, count } = await query;
  assertNoError(error);

  const items = (data ?? []) as InboundPartnerCampaign[];
  const total = count ?? 0;

  return {
    items,
    total,
    page,
    pageSize,
    hasNextPage: page * pageSize < total,
  };
}

export async function getCampaignRedemptions(
  filters: CampaignAuditFilters = {},
  pageRequest: CampaignAuditPageRequest = {}
): Promise<PaginatedResult<CopyTradingCampaignRedemption>> {
  const { page, pageSize, from, to } = normalizePagination(pageRequest);
  let query = supabase
    .from('copy_trading_campaign_redemptions')
    .select(
      'id, auth_user_id, partner, campaign_code, trial_days, entitlement_expires_at, inbound_campaign_id, applied_at, created_at',
      { count: 'exact' }
    )
    .order('applied_at', { ascending: false })
    .range(from, to);

  if (filters.partner) {
    query = query.eq('partner', filters.partner.toLowerCase().trim());
  }

  if (filters.promoCode) {
    query = query.eq('campaign_code', filters.promoCode.toUpperCase().trim());
  }

  query = applyDateFilters(query, 'applied_at', filters);

  const { data, error, count } = await query;
  assertNoError(error);

  const items = (data ?? []) as CopyTradingCampaignRedemption[];
  const total = count ?? 0;

  return {
    items,
    total,
    page,
    pageSize,
    hasNextPage: page * pageSize < total,
  };
}
