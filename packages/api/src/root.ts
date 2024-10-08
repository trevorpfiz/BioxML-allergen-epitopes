import { authRouter } from "./router/auth";
import { conformationalBPredictionRouter } from "./router/conformational-b-prediction";
import { jobRouter } from "./router/job";
import { linearBPredictionRouter } from "./router/linear-b-prediction";
import { mhcIPredictionRouter } from "./router/mhc-i-prediction";
import { mhcIIPredictionRouter } from "./router/mhc-ii-prediction";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  conformationalBPrediction: conformationalBPredictionRouter,
  linearBPrediction: linearBPredictionRouter,
  mhcIPrediction: mhcIPredictionRouter,
  mhcIIPrediction: mhcIIPredictionRouter,
  job: jobRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
