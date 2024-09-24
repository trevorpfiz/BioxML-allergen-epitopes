import { z } from "zod";

// Define enums
const AlertNameEnum = z.enum([
  "unknown",
  "high",
  "low",
  "rise",
  "fall",
  "outOfRange",
  "urgentLow",
  "urgentLowSoon",
  "noReadings",
  "fixedLow",
]);

const AlertStateEnum = z.enum([
  "unknown",
  "inactive",
  "activeSnoozed",
  "activeAlarming",
]);

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

// Define the Alert schema
const AlertSchema = z.object({
  recordId: z.string(),
  systemTime: z.string().datetime(),
  displayTime: z.string().datetime(),
  alertName: AlertNameEnum,
  alertState: AlertStateEnum,
  displayDevice: DisplayDeviceEnum,
  transmitterGeneration: TransmitterGenerationEnum,
  transmitterId: z.string(),
  displayApp: z.string(),
});

// Define the Alerts response schema
const AlertsResponseSchema = z.object({
  recordType: z.literal("alert"),
  recordVersion: z.string(),
  userId: z.string(),
  records: z.array(AlertSchema),
});

export type Alert = z.infer<typeof AlertSchema>;
export type AlertsResponse = z.infer<typeof AlertsResponseSchema>;

export { AlertSchema, AlertsResponseSchema };
