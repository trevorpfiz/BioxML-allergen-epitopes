import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { eq } from "@epi/db";
import {
  insertLinearBPredictionParams,
  LinearBPrediction,
} from "@epi/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

export const linearBPredictionRouter = {
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;

      const row = await ctx.db.query.LinearBPrediction.findFirst({
        where: eq(LinearBPrediction.id, id),
      });

      return { prediction: row };
    }),

  create: protectedProcedure
    .input(insertLinearBPredictionParams)
    .mutation(async ({ ctx, input }) => {
      const {
        sequence,
        bCellImmunogenicityMethod,
        bcrRecognitionProbabilityMethod,
        jobId,
      } = input;

      const [prediction] = await ctx.db
        .insert(LinearBPrediction)
        .values({
          sequence,
          bCellImmunogenicityMethod,
          bcrRecognitionProbabilityMethod,
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

      const data = await ctx.db.query.LinearBPrediction.findFirst({
        where: eq(LinearBPrediction.id, id),
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
        .delete(LinearBPrediction)
        .where(eq(LinearBPrediction.id, id))
        .returning();

      return { prediction };
    }),
} satisfies TRPCRouterRecord;
