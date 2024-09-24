// File: conformationalBPredictionRouter.ts

import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { and, desc, eq } from "@epi/db";
import {
  ConformationalBPrediction,
  insertConformationalBPredictionParams,
} from "@epi/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

// This function is a placeholder for your actual prediction logic
async function performConformationalBPrediction(input: any) {
  // Implement your prediction logic here
  return {
    /* prediction results */
  };
}

export const conformationalBPredictionRouter = {
  all: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.query.ConformationalBPrediction.findMany({
      orderBy: desc(ConformationalBPrediction.id),
      limit: 10,
    });

    return { predictions: rows };
  }),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;

      const row = await ctx.db.query.ConformationalBPrediction.findFirst({
        where: eq(ConformationalBPrediction.id, id),
      });

      return { prediction: row };
    }),

  byUser: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const rows = await ctx.db.query.ConformationalBPrediction.findMany({
      where: eq(ConformationalBPrediction.profileId, userId),
      orderBy: desc(ConformationalBPrediction.createdAt),
    });

    return { predictions: rows };
  }),

  create: protectedProcedure
    .input(insertConformationalBPredictionParams)
    .mutation(async ({ ctx, input }) => {
      const { sequence, isStructureBased, pdbId, chain } = input;
      const userId = ctx.user.id;

      // Here you would typically call your prediction service/API
      const result = await performConformationalBPrediction(input);

      const [prediction] = await ctx.db
        .insert(ConformationalBPrediction)
        .values({
          sequence,
          isStructureBased,
          pdbId,
          chain,
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

      const data = await ctx.db.query.ConformationalBPrediction.findFirst({
        where: eq(ConformationalBPrediction.id, id),
      });

      if (data?.profileId !== userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only the owner is allowed to delete the prediction",
        });
      }

      const [prediction] = await ctx.db
        .delete(ConformationalBPrediction)
        .where(
          and(
            eq(ConformationalBPrediction.id, id),
            eq(ConformationalBPrediction.profileId, userId),
          ),
        )
        .returning();

      return { prediction };
    }),
} satisfies TRPCRouterRecord;
