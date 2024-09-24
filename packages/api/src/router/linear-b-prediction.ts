import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { and, desc, eq } from "@epi/db";
import {
  insertLinearBPredictionParams,
  LinearBPrediction,
} from "@epi/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

// This function is a placeholder for your actual prediction logic
async function performLinearBPrediction(input: { sequence: string }) {
  // Implement your prediction logic here
  // This should interface with your chosen linear B-cell epitope prediction tool (e.g., BepiPred-2.0)
  return {
    /* prediction results */
  };
}

export const linearBPredictionRouter = {
  all: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.query.LinearBPrediction.findMany({
      orderBy: desc(LinearBPrediction.id),
      limit: 10,
    });

    return { predictions: rows };
  }),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;

      const row = await ctx.db.query.LinearBPrediction.findFirst({
        where: eq(LinearBPrediction.id, id),
      });

      return { prediction: row };
    }),

  byUser: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const rows = await ctx.db.query.LinearBPrediction.findMany({
      where: eq(LinearBPrediction.profileId, userId),
      orderBy: desc(LinearBPrediction.createdAt),
    });

    return { predictions: rows };
  }),

  create: protectedProcedure
    .input(insertLinearBPredictionParams)
    .mutation(async ({ ctx, input }) => {
      const { sequence } = input;
      const userId = ctx.user.id;

      // Here you would typically call your prediction service/API
      const result = await performLinearBPrediction(input);

      const [prediction] = await ctx.db
        .insert(LinearBPrediction)
        .values({
          sequence,
          result,
          profileId: userId,
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
      });

      if (data?.profileId !== userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only the owner is allowed to delete the prediction",
        });
      }

      const [prediction] = await ctx.db
        .delete(LinearBPrediction)
        .where(
          and(
            eq(LinearBPrediction.id, id),
            eq(LinearBPrediction.profileId, userId),
          ),
        )
        .returning();

      return { prediction };
    }),

  // Additional method to handle multiple sequences
  createMultiple: protectedProcedure
    .input(
      z.object({
        sequences: z.array(z.string()).min(1).max(50), // Limit to 50 sequences as per BepiPred-2.0 example
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { sequences } = input;
      const userId = ctx.user.id;

      const predictions = await Promise.all(
        sequences.map(async (sequence) => {
          const result = await performLinearBPrediction({ sequence });

          const [prediction] = await ctx.db
            .insert(LinearBPrediction)
            .values({
              sequence,
              result,
              profileId: userId,
            })
            .returning();

          return prediction;
        }),
      );

      return { predictions };
    }),
} satisfies TRPCRouterRecord;
