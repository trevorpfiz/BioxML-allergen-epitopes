import { z } from "zod";

const EventStatusEnum = z.enum(["created", "updated", "deleted"]);
const EventTypeEnum = z.enum([
  "unknown",
  "insulin",
  "carbs",
  "exercise",
  "health",
  "bloodGlucose",
  "notes",
]);
const EventSubTypeEnum = z
  .enum([
    "unknown",
    "fastActing",
    "longActing",
    "light",
    "medium",
    "heavy",
    "illness",
    "stress",
    "highSymptoms",
    "lowSymptoms",
    "cycle",
    "alcohol",
  ])
  .nullable();
const UnitEnum = z.enum(["unknown", "grams", "mg/dL", "minutes", "units"]);
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

const EventSchema = z.object({
  systemTime: z.string().datetime(),
  displayTime: z.string().datetime(),
  recordId: z.string(),
  eventStatus: EventStatusEnum,
  eventType: EventTypeEnum,
  eventSubType: EventSubTypeEnum,
  value: z.string(),
  unit: UnitEnum.nullable(),
  transmitterId: z.string(),
  transmitterGeneration: TransmitterGenerationEnum,
  displayDevice: DisplayDeviceEnum,
});

const EventsResponseSchema = z.object({
  recordType: z.literal("event"),
  recordVersion: z.string(),
  userId: z.string(),
  records: z.array(EventSchema),
});

export type Event = z.infer<typeof EventSchema>;
export type EventsResponse = z.infer<typeof EventsResponseSchema>;

export { EventSchema, EventsResponseSchema };
