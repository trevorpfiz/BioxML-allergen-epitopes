import { z } from "zod";

export const dexcomDateTimeSchema = z.string().refine(
  (value) => {
    // This regex allows ISO 8601 format with or without milliseconds and with or without UTC offset
    const regex =
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})?$/;
    return regex.test(value);
  },
  {
    message:
      "Invalid datetime format. Expected ISO 8601 format (with or without milliseconds, with or without UTC offset).",
  },
);
