import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { healthCheck, hfPredict } from "../lib/api/client";
import { protectedProcedure, publicProcedure } from "../trpc";

export const authRouter = {
  me: publicProcedure.query(({ ctx }) => {
    return ctx.user;
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can see this secret message!";
  }),

  testFastAPI: protectedProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const { token } = input;

      const response = await healthCheck({
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response;
    }),

  predict: protectedProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const { token } = input;

      const fixedInput = "I am really happy this works.";

      const response = await hfPredict({
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          inputs: fixedInput,
        },
      });

      return response;
    }),
} satisfies TRPCRouterRecord;
