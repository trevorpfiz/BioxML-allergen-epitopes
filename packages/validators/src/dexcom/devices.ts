import { z } from "zod";

const TransmitterGenerationEnum = z.enum([
  "unknown",
  "g4",
  "g5",
  "g6",
  "g6+",
  "dexcomPro",
  "g7",
]);

const DisplayDeviceEnum = z.enum(["unknown", "receiver", "iOS", "android"]);

const DaysOfWeekEnum = z.enum([
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
]);

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

const UnitEnum = z.enum([
  "mg/dL",
  "mmol/L",
  "mg/dL/min",
  "mmol/L/min",
  "minutes",
]);

const SoundThemeEnum = z.enum(["unknown", "modern", "classic"]);

const SoundOutputModeEnum = z.enum([
  "unknown",
  "sound",
  "vibrate",
  "match",
  "matchPhone",
]);

const OverrideModeEnum = z.enum(["unknown", "quiet", "vibrate"]);

const OverrideSettingSchema = z.object({
  isOverrideEnabled: z.boolean(),
  mode: OverrideModeEnum,
  endTime: z.string(),
});

const DeviceAlertScheduleSettingsSchema = z.object({
  alertScheduleName: z.string(),
  isEnabled: z.boolean(),
  isDefaultSchedule: z.boolean().optional(),
  startTime: z.string(),
  endTime: z.string(),
  daysOfWeek: z.array(DaysOfWeekEnum),
  isActive: z.boolean(),
  override: OverrideSettingSchema,
});

const DeviceAlertSettingSchema = z.object({
  alertName: AlertNameEnum,
  value: z.number().int().nullable(),
  unit: UnitEnum,
  snooze: z.number().int().nullable().optional(),
  enabled: z.boolean(),
  systemTime: z.string().datetime(),
  displayTime: z.string(),
  delay: z.number().int().nullable().optional(),
  SecondaryTriggerCondition: z.number().int().optional(),
  soundTheme: SoundThemeEnum,
  soundOutputMode: SoundOutputModeEnum,
});

const DeviceSchema = z.object({
  lastUploadDate: z.string().datetime(),
  transmitterId: z.string(),
  transmitterGeneration: TransmitterGenerationEnum,
  displayDevice: DisplayDeviceEnum,
  displayApp: z.string(),
  alertSchedules: z.array(
    z.object({
      alertScheduleSettings: DeviceAlertScheduleSettingsSchema,
      alertSettings: z.array(DeviceAlertSettingSchema),
    }),
  ),
});

const DevicesResponseSchema = z.object({
  recordType: z.literal("device"),
  recordVersion: z.string(),
  userId: z.string(),
  records: z.array(DeviceSchema),
});

export type Device = z.infer<typeof DeviceSchema>;
export type DevicesResponse = z.infer<typeof DevicesResponseSchema>;

export { DeviceSchema, DevicesResponseSchema };
