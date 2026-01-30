"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  QueryKey,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { ApiError } from "@/lib/api/client";
import { useToast } from "@/components/common/ToastProvider";

const DEFAULT_STALE_TIME = 60_000;
const DEFAULT_CACHE_TIME = 5 * 60_000;

const getErrorMessage = (error: unknown, fallback = "Request failed.") =>
  error instanceof ApiError ? error.message || fallback : fallback;

export type AdminQueryOptions<
  TQueryFnData,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
> = UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> & {
  toastOnError?: boolean;
  errorMessage?: string;
  cacheTime?: number;
};

export function useAdminQuery<
  TQueryFnData,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(options: AdminQueryOptions<TQueryFnData, TError, TData, TQueryKey>): UseQueryResult<TData, TError> {
  const toast = useToast();
  const { toastOnError = false, errorMessage, onError, cacheTime, ...rest } = options;

  return useQuery({
    staleTime: DEFAULT_STALE_TIME,
    gcTime: cacheTime ?? DEFAULT_CACHE_TIME,
    retry: 1,
    refetchOnWindowFocus: false,
    ...rest,
    onError: (err) => {
      if (toastOnError) {
        toast.push({
          message: getErrorMessage(err, errorMessage),
          type: "error",
        });
      }
      onError?.(err);
    },
  });
}

export type AdminMutationOptions<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown
> = UseMutationOptions<TData, TError, TVariables, TContext> & {
  toastOnError?: boolean;
  toastOnSuccess?: boolean;
  errorMessage?: string;
  successMessage?: string;
};

export function useAdminMutation<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown
>(options: AdminMutationOptions<TData, TError, TVariables, TContext>): UseMutationResult<TData, TError, TVariables, TContext> {
  const toast = useToast();
  const {
    toastOnError = true,
    toastOnSuccess = false,
    errorMessage,
    successMessage,
    onError,
    onSuccess,
    ...rest
  } = options;

  return useMutation({
    ...rest,
    onError: (err, variables, context) => {
      if (toastOnError) {
        toast.push({
          message: getErrorMessage(err, errorMessage),
          type: "error",
        });
      }
      onError?.(err, variables, context);
    },
    onSuccess: (data, variables, context) => {
      if (toastOnSuccess && successMessage) {
        toast.push({ message: successMessage, type: "success" });
      }
      onSuccess?.(data, variables, context);
    },
  });
}
