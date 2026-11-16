"use client";

import useSWR from "swr";
import type { ProductCardData } from "@/components/storefront/ProductCard";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface UseProductsOptions {
  division: string;
  limit?: number;
}

export function useProducts({ division, limit = 24 }: UseProductsOptions) {
  const { data, error, isLoading, mutate } = useSWR<ProductCardData[]>(
    `/api/catalogue/products?division=${division}&limit=${limit}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
      focusThrottleInterval: 5000,
    }
  );

  return {
    products: data ?? [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useProduct(division: string, slug: string) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/catalogue/products?division=${division}&slug=${slug}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    product: data?.[0] ?? null,
    isLoading,
    isError: error,
    mutate,
  };
}