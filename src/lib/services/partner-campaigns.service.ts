import { InboundPromoValidation } from '../../types';
import { supabase } from '../supabase';
import { assertNoError } from './shared';

export async function validateInboundPromo(
  partner: string,
  promoCode: string
): Promise<InboundPromoValidation> {
  const { data, error } = await supabase.rpc('validate_inbound_partner_promo', {
    p_partner: partner,
    p_promo_code: promoCode,
  });

  assertNoError(error);

  const [result] = (data ?? []) as InboundPromoValidation[];

  return (
    result ?? {
      partner,
      promo_code: promoCode,
      trial_days: null,
      is_valid: false,
    }
  );
}
