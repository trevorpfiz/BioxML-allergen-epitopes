import { authRouter } from "./router/auth";
import { conformationalBPredictionRouter } from "./router/conformational-b-prediction";
import { linearBPredictionRouter } from "./router/linear-b-prediction";
import { mhcIPredictionRouter } from "./router/mhc-i-prediction";
import { mhcIIPredictionRouter } from "./router/mhc-ii-prediction";
import { reportRouter } from "./router/report";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  conformationalBPrediction: conformationalBPredictionRouter,
  linearBPrediction: linearBPredictionRouter,
  mhcIPrediction: mhcIPredictionRouter,
  mhcIIPrediction: mhcIIPredictionRouter,
  report: reportRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
