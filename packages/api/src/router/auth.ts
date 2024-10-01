import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { healthCheck } from "../lib/api/client";
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
} satisfies TRPCRouterRecord;
