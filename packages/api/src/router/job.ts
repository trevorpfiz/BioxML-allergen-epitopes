import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { and, desc, eq } from "@epi/db";
import { insertJobParams, Job, updateJobParams } from "@epi/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

export const jobRouter = {
  all: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.query.Job.findMany({
      orderBy: desc(Job.id),
      limit: 20,
      with: {
        linearBPredictions: true,
        conformationalBPredictions: true,
        mhcIPredictions: true,
        mhcIIPredictions: true,
      },
    });

    return { jobs: rows };
  }),

  byId: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;

      const row = await ctx.db.query.Job.findFirst({
        where: eq(Job.id, id),
        with: {
          linearBPredictions: true,
          conformationalBPredictions: true,
          mhcIPredictions: true,
          mhcIIPredictions: true,
        },
      });

      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Job not found",
        });
      }

      return { job: row };
    }),

  byUser: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const rows = await ctx.db.query.Job.findMany({
      where: eq(Job.profileId, userId),
      orderBy: desc(Job.createdAt),
      limit: 20,
      with: {
        linearBPredictions: true,
        conformationalBPredictions: true,
        mhcIPredictions: true,
        mhcIIPredictions: true,
      },
    });

    return { jobs: rows };
  }),

  create: protectedProcedure
    .input(insertJobParams)
    .mutation(async ({ ctx, input }) => {
      const { name, type } = input;
      const userId = ctx.user.id;

      const [r] = await ctx.db
        .insert(Job)
        .values({
          name,
          type,
          profileId: userId,
        })
        .returning();

      return { job: r };
    }),

  update: protectedProcedure
    .input(updateJobParams)
    .mutation(async ({ ctx, input }) => {
      const { id, name, type, shareToken } = input;
      const userId = ctx.user.id;

      const [r] = await ctx.db
        .update(Job)
        .set({
          name,
          type,
          shareToken,
        })
        .where(and(eq(Job.id, id), eq(Job.profileId, userId)))
        .returning();

      return { job: r };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      const userId = ctx.user.id;

      const data = await ctx.db.query.Job.findFirst({
        where: eq(Job.id, id),
      });

      if (data?.profileId !== userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only the owner is allowed to delete the job",
        });
      }

      const [r] = await ctx.db
        .delete(Job)
        .where(and(eq(Job.id, id), eq(Job.profileId, userId)))
        .returning();

      return { job: r };
    }),

  generateShareLink: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      const userId = ctx.user.id;

      const job = await ctx.db.query.Job.findFirst({
        where: and(eq(Job.id, id), eq(Job.profileId, userId)),
      });

      if (!job) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Job not found or access denied.",
        });
      }

      // Generate a new shareToken if it doesn't exist
      let { shareToken } = job;
      if (!shareToken) {
        shareToken = crypto.randomUUID();
        await ctx.db.update(Job).set({ shareToken }).where(eq(Job.id, id));
      }

      const shareUrl =
        process.env.NODE_ENV === "production"
          ? `${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/share/${shareToken}`
          : `http://localhost:3000/share/${shareToken}`;

      return { shareUrl };
    }),

  getSharedJob: publicProcedure
    .input(z.object({ shareToken: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { shareToken } = input;

      const job = await ctx.db.query.Job.findFirst({
        where: eq(Job.shareToken, shareToken),
        with: {
          linearBPredictions: true,
          conformationalBPredictions: true,
          mhcIPredictions: true,
          mhcIIPredictions: true,
        },
      });

      if (!job) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Shared job not found.",
        });
      }

      return { job };
    }),
} satisfies TRPCRouterRecord;
