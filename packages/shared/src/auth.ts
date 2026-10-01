import { z } from 'zod';
import {
  displayNameSchema,
  emailSchema,
  PASSWORD_MAX_LENGTH,
  passwordSchema,
} from './account-fields.js';
import { userSchema } from './users.js';

const emailTokenSchema = z.string().min(1).max(200);

export const registerInputSchema = z.object({
  displayName: displayNameSchema,
  email: emailSchema,
  password: passwordSchema,
});
export type RegisterInput = z.infer<typeof registerInputSchema>;

export const loginInputSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Enter your password').max(PASSWORD_MAX_LENGTH),
});
export type LoginInput = z.infer<typeof loginInputSchema>;

export const googleSignInInputSchema = z.object({
  idToken: z.string().min(1).max(4096),
});
export type GoogleSignInInput = z.infer<typeof googleSignInInputSchema>;

export const verifyEmailInputSchema = z.object({ token: emailTokenSchema });
export type VerifyEmailInput = z.infer<typeof verifyEmailInputSchema>;

export const forgotPasswordInputSchema = z.object({ email: emailSchema });
export type ForgotPasswordInput = z.infer<typeof forgotPasswordInputSchema>;

export const resetPasswordInputSchema = z.object({
  token: emailTokenSchema,
  password: passwordSchema,
});
export type ResetPasswordInput = z.infer<typeof resetPasswordInputSchema>;

export const authSessionSchema = z.object({
  accessToken: z.string(),
  user: userSchema,
});
export type AuthSessionDto = z.infer<typeof authSessionSchema>;

export const EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED';
