import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { publicApi } from '@/api/public.api';
import { queryKeys } from '@/lib/queryKeys';

const FIVE_MIN = 5 * 60 * 1000;
const ONE_MIN = 60 * 1000;

export const useBanners = () =>
  useQuery({ queryKey: queryKeys.banners, queryFn: publicApi.banners, staleTime: FIVE_MIN });

export const useCategories = () =>
  useQuery({ queryKey: queryKeys.categories, queryFn: publicApi.categories, staleTime: FIVE_MIN });

export const useProducts = (params) =>
  useQuery({
    queryKey: queryKeys.products(params),
    queryFn: () => publicApi.products(params),
    staleTime: ONE_MIN,
    placeholderData: keepPreviousData,
  });

export const useProduct = (slug) =>
  useQuery({ queryKey: queryKeys.product(slug), queryFn: () => publicApi.product(slug), enabled: Boolean(slug) });

export const useProjects = (params) =>
  useQuery({
    queryKey: queryKeys.projects(params),
    queryFn: () => publicApi.projects(params),
    staleTime: ONE_MIN,
    placeholderData: keepPreviousData,
  });

export const useProject = (slug) =>
  useQuery({ queryKey: queryKeys.project(slug), queryFn: () => publicApi.project(slug), enabled: Boolean(slug) });
