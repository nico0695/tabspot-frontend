import * as z from 'zod';

export const artistFormSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(200, 'Máximo 200 caracteres'),
  sortName: z.string().max(200, 'Máximo 200 caracteres').optional().or(z.literal('')),
});

export type ArtistFormData = z.infer<typeof artistFormSchema>;
