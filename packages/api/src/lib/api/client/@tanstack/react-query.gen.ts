// This file is auto-generated by @hey-api/openapi-ts

import type { Options } from "@hey-api/client-fetch";
import type { UseMutationOptions } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";

import type {
  HfPredictData,
  HfPredictError,
  HfPredictResponse,
} from "../types.gen";
import { client, healthCheck, hfPredict } from "../services.gen";

type QueryKey<TOptions extends Options> = [
  Pick<TOptions, "baseUrl" | "body" | "headers" | "path" | "query"> & {
    _id: string;
    _infinite?: boolean;
  },
];

const createQueryKey = <TOptions extends Options>(
  id: string,
  options?: TOptions,
  infinite?: boolean,
): QueryKey<TOptions>[0] => {
  const params: QueryKey<TOptions>[0] = {
    _id: id,
    baseUrl: (options?.client ?? client).getConfig().baseUrl,
  } as QueryKey<TOptions>[0];
  if (infinite) {
    params._infinite = infinite;
  }
  if (options?.body) {
    params.body = options.body;
  }
  if (options?.headers) {
    params.headers = options.headers;
  }
  if (options?.path) {
    params.path = options.path;
  }
  if (options?.query) {
    params.query = options.query;
  }
  return params;
};

export const healthCheckQueryKey = (options?: Options) => [
  createQueryKey("healthCheck", options),
];

export const healthCheckOptions = (options?: Options) => {
  return queryOptions({
    queryFn: async ({ queryKey }) => {
      const { data } = await healthCheck({
        ...options,
        ...queryKey[0],
        throwOnError: true,
      });
      return data;
    },
    queryKey: healthCheckQueryKey(options),
  });
};

export const hfPredictQueryKey = (options: Options<HfPredictData>) => [
  createQueryKey("hfPredict", options),
];

export const hfPredictOptions = (options: Options<HfPredictData>) => {
  return queryOptions({
    queryFn: async ({ queryKey }) => {
      const { data } = await hfPredict({
        ...options,
        ...queryKey[0],
        throwOnError: true,
      });
      return data;
    },
    queryKey: hfPredictQueryKey(options),
  });
};

export const hfPredictMutation = () => {
  const mutationOptions: UseMutationOptions<
    HfPredictResponse,
    HfPredictError,
    Options<HfPredictData>
  > = {
    mutationFn: async (options) => {
      const { data } = await hfPredict({
        ...options,
        throwOnError: true,
      });
      return data;
    },
  };
  return mutationOptions;
};
