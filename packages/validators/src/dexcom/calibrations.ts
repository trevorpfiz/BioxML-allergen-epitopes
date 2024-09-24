import { z } from "zod";

const UnitEnum = z.enum(["unknown", "mg/dL", "mmol/L"]);
const DisplayDeviceEnum = z.enum(["unknown", "receiver", "iOS", "android"]);
const TransmitterGenerationEnum = z.enum([
  "unknown",
  "g4",
  "g5",
  "g6",
  "g6+",
  "dexcomPro",
  "g7",
]);

const CalibrationSchema = z.object({
  recordId: z.string(),
  unit: UnitEnum.nullable(),
  systemTime: z.string().datetime(),
  displayTime: z.string().datetime(),
  value: z.number().int(),
  displayDevice: DisplayDeviceEnum,
  transmitterId: z.string(),
  transmitterTicks: z.number().int(),
  transmitterGeneration: TransmitterGenerationEnum,
});

const CalibrationsResponseSchema = z.object({
  recordType: z.literal("calibration"),
  recordVersion: z.string(),
  userId: z.string(),
  records: z.array(CalibrationSchema),
});

export type Calibration = z.infer<typeof CalibrationSchema>;
export type CalibrationsResponse = z.infer<typeof CalibrationsResponseSchema>;

export { CalibrationSchema, CalibrationsResponseSchema };
