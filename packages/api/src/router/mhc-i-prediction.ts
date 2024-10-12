import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { eq } from "@epi/db";
import { insertMhcIPredictionParams, MhcIPrediction } from "@epi/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

export const mhcIPredictionRouter = {
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;

      const row = await ctx.db.query.MhcIPrediction.findFirst({
        where: eq(MhcIPrediction.id, id),
      });

      return { prediction: row };
    }),

  create: protectedProcedure
    .input(insertMhcIPredictionParams)
    .mutation(async ({ ctx, input }) => {
      const {
        sequence,
        alleles,
        tcrRecognitionProbabilityMethod,
        mhcBindingAffinityMethod,
        pmhcStabilityMethod,
        jobId,
      } = input;

      const [prediction] = await ctx.db
        .insert(MhcIPrediction)
        .values({
          sequence,
          alleles,
          tcrRecognitionProbabilityMethod,
          mhcBindingAffinityMethod,
          pmhcStabilityMethod,
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

      const data = await ctx.db.query.MhcIPrediction.findFirst({
        where: eq(MhcIPrediction.id, id),
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
        .delete(MhcIPrediction)
        .where(eq(MhcIPrediction.id, id))
        .returning();

      return { prediction };
    }),
} satisfies TRPCRouterRecord;
