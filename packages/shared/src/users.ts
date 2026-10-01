import { z } from 'zod';
import { displayNameSchema, passwordSchema, PASSWORD_MAX_LENGTH } from './account-fields.js';

export const userSchema = z.object({
  id: z.uuid(),
  email: z.string(),
  displayName: z.string(),
  isEmailVerified: z.boolean(),
  hasPassword: z.boolean(),
  hasGoogle: z.boolean(),
});
export type UserDto = z.infer<typeof userSchema>;

export const updateMeInputSchema = z.object({ displayName: displayNameSchema });
export type UpdateMeInput = z.infer<typeof updateMeInputSchema>;

export const changePasswordInputSchema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password').max(PASSWORD_MAX_LENGTH),
  newPassword: passwordSchema,
});
export type ChangePasswordInput = z.infer<typeof changePasswordInputSchema>;
