import { useQuery } from '@tanstack/react-query';
import { publicApi } from '@/api/public.api';
import { queryKeys } from '@/lib/queryKeys';

const FIVE_MIN = 5 * 60 * 1000;

/** Public site settings (company, contact, social, about, legal, seo). Cached 5 min. */
export function useSettings() {
  const query = useQuery({ queryKey: queryKeys.settings, queryFn: publicApi.settings, staleTime: FIVE_MIN });
  const s = query.data ?? {};
  return {
    ...query,
    settings: s,
    company: s.company ?? { name: 'ARKA Solar Energy', tagline: 'Harness the Sun for a Greener Tomorrow' },
    contact: s.contact ?? { phones: [], emails: [] },
    social: s.social ?? {},
  };
}
