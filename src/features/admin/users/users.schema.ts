import * as z from 'zod';

export const changeRoleSchema = z.object({
  role: z.enum(['USER', 'ADMIN'], { message: 'Seleccioná un rol válido' }),
});

export type ChangeRoleFormData = z.infer<typeof changeRoleSchema>;

export const changeStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'BLOCKED'], { message: 'Seleccioná un estado válido' }),
});

export type ChangeStatusFormData = z.infer<typeof changeStatusSchema>;
