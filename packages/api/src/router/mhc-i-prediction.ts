import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { and, desc, eq } from "@epi/db";
import { insertMhcIPredictionParams, MhcIPrediction } from "@epi/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

// This function is a placeholder for your actual prediction logic
async function performMhcIPrediction(input: any) {
  // Implement your prediction logic here
  return {
    /* prediction results */
  };
}

export const mhcIPredictionRouter = {
  all: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.query.MhcIPrediction.findMany({
      orderBy: desc(MhcIPrediction.id),
      limit: 10,
    });

    return { predictions: rows };
  }),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;

      const row = await ctx.db.query.MhcIPrediction.findFirst({
        where: eq(MhcIPrediction.id, id),
      });

      return { prediction: row };
    }),

  byUser: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const rows = await ctx.db.query.MhcIPrediction.findMany({
      where: eq(MhcIPrediction.profileId, userId),
      orderBy: desc(MhcIPrediction.createdAt),
    });

    return { predictions: rows };
  }),

  create: protectedProcedure
    .input(insertMhcIPredictionParams)
    .mutation(async ({ ctx, input }) => {
      const {
        sequence,
        predictionMethod,
        species,
        allele,
        showOnlyFrequentAlleles,
      } = input;
      const userId = ctx.user.id;

      // Here you would typically call your prediction service/API
      const result = await performMhcIPrediction(input);

      const [prediction] = await ctx.db
        .insert(MhcIPrediction)
        .values({
          sequence,
          predictionMethod,
          species,
          allele,
          showOnlyFrequentAlleles,
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

      const data = await ctx.db.query.MhcIPrediction.findFirst({
        where: eq(MhcIPrediction.id, id),
      });

      if (data?.profileId !== userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only the owner is allowed to delete the prediction",
        });
      }

      const [prediction] = await ctx.db
        .delete(MhcIPrediction)
        .where(
          and(eq(MhcIPrediction.id, id), eq(MhcIPrediction.profileId, userId)),
        )
        .returning();

      return { prediction };
    }),
} satisfies TRPCRouterRecord;
