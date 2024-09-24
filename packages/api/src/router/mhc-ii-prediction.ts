import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { and, desc, eq } from "@epi/db";
import { insertMhcIIPredictionParams, MhcIIPrediction } from "@epi/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

// This function is a placeholder for your actual prediction logic
async function performMhcIIPrediction(input: any) {
  // Implement your prediction logic here
  return {
    /* prediction results */
  };
}

export const mhcIIPredictionRouter = {
  all: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.query.MhcIIPrediction.findMany({
      orderBy: desc(MhcIIPrediction.id),
      limit: 10,
    });

    return { predictions: rows };
  }),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;

      const row = await ctx.db.query.MhcIIPrediction.findFirst({
        where: eq(MhcIIPrediction.id, id),
      });

      return { prediction: row };
    }),

  byUser: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const rows = await ctx.db.query.MhcIIPrediction.findMany({
      where: eq(MhcIIPrediction.profileId, userId),
      orderBy: desc(MhcIIPrediction.createdAt),
    });

    return { predictions: rows };
  }),

  create: protectedProcedure
    .input(insertMhcIIPredictionParams)
    .mutation(async ({ ctx, input }) => {
      const {
        sequence,
        predictionMethod,
        speciesLocus,
        allele,
        separateAlphaBetaChains,
        peptideLength,
      } = input;
      const userId = ctx.user.id;

      // Here you would typically call your prediction service/API
      const result = await performMhcIIPrediction(input);

      const [prediction] = await ctx.db
        .insert(MhcIIPrediction)
        .values({
          sequence,
          predictionMethod,
          speciesLocus,
          allele,
          separateAlphaBetaChains,
          peptideLength,
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

      const data = await ctx.db.query.MhcIIPrediction.findFirst({
        where: eq(MhcIIPrediction.id, id),
      });

      if (data?.profileId !== userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only the owner is allowed to delete the prediction",
        });
      }

      const [prediction] = await ctx.db
        .delete(MhcIIPrediction)
        .where(
          and(
            eq(MhcIIPrediction.id, id),
            eq(MhcIIPrediction.profileId, userId),
          ),
        )
        .returning();

      return { prediction };
    }),
} satisfies TRPCRouterRecord;
