import { z } from "zod";

export const OAuthTokenResponseSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  token_type: z.literal("Bearer"),
  refresh_token: z.string(),
});
export type OAuthTokenResponse = z.infer<typeof OAuthTokenResponseSchema>;

export const OAuthErrorResponseSchema = z.object({
  error: z.enum([
    "invalid_request",
    "invalid_client",
    "invalid_grant",
    "unauthorized_client",
    "unsupported_grant_type",
  ]),
  error_description: z.string().optional(),
  error_uri: z.string().optional(),
});
export type OAuthErrorResponse = z.infer<typeof OAuthErrorResponseSchema>;
