import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { eq } from "@epi/db";
import { insertMhcIIPredictionParams, MhcIIPrediction } from "@epi/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

export const mhcIIPredictionRouter = {
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;

      const row = await ctx.db.query.MhcIIPrediction.findFirst({
        where: eq(MhcIIPrediction.id, id),
      });

      return { prediction: row };
    }),

  create: protectedProcedure
    .input(insertMhcIIPredictionParams)
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
        .insert(MhcIIPrediction)
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

      const data = await ctx.db.query.MhcIIPrediction.findFirst({
        where: eq(MhcIIPrediction.id, id),
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
        .delete(MhcIIPrediction)
        .where(eq(MhcIIPrediction.id, id))
        .returning();

      return { prediction };
    }),
} satisfies TRPCRouterRecord;
