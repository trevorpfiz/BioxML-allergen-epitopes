import { z } from "zod";

import { dexcomDateTimeSchema } from "./shared";

const DataRangeMomentSchema = z.object({
  systemTime: dexcomDateTimeSchema,
  displayTime: dexcomDateTimeSchema,
});

const DataRangeStartAndEndSchema = z.object({
  start: DataRangeMomentSchema,
  end: DataRangeMomentSchema,
});

const DataRangeResponseSchema = z.object({
  recordType: z.literal("dataRange"),
  recordVersion: z.string(),
  userId: z.string(),
  calibrations: DataRangeStartAndEndSchema.optional(),
  egvs: DataRangeStartAndEndSchema.optional(),
  events: DataRangeStartAndEndSchema.optional(),
});

export type DataRangeMoment = z.infer<typeof DataRangeMomentSchema>;
export type DataRangeStartAndEnd = z.infer<typeof DataRangeStartAndEndSchema>;
export type DataRangeResponse = z.infer<typeof DataRangeResponseSchema>;

export {
  DataRangeMomentSchema,
  DataRangeStartAndEndSchema,
  DataRangeResponseSchema,
};
