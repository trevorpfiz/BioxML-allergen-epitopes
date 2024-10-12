import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { eq } from "@epi/db";
import {
  ConformationalBPrediction,
  insertConformationalBPredictionParams,
} from "@epi/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

export const conformationalBPredictionRouter = {
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;

      const row = await ctx.db.query.ConformationalBPrediction.findFirst({
        where: eq(ConformationalBPrediction.id, id),
      });

      return { prediction: row };
    }),

  create: protectedProcedure
    .input(insertConformationalBPredictionParams)
    .mutation(async ({ ctx, input }) => {
      const {
        pdbId,
        chain,
        bcrRecognitionProbabilityMethod,
        surfaceAccessibilityMethod,
        jobId,
      } = input;

      const [prediction] = await ctx.db
        .insert(ConformationalBPrediction)
        .values({
          pdbId,
          chain,
          bcrRecognitionProbabilityMethod,
          surfaceAccessibilityMethod,
          jobId,
        })
        .returning();

      return { prediction };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      const userId = ctx.user.id;

      const data = await ctx.db.query.ConformationalBPrediction.findFirst({
        where: eq(ConformationalBPrediction.id, id),
        with: {
          job: true,
        },
      });

      if (data?.job.profileId !== userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only the owner is allowed to delete the prediction",
        });
      }

      const [prediction] = await ctx.db
        .delete(ConformationalBPrediction)
        .where(eq(ConformationalBPrediction.id, id))
        .returning();

      return { prediction };
    }),
} satisfies TRPCRouterRecord;
