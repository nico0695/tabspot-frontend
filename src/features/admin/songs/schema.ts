import * as z from 'zod';

export const songFormSchema = z.object({
  artistId: z.string().min(1, 'El artista es obligatorio'),
  title: z.string().min(1, 'El título es obligatorio').max(300, 'Máximo 300 caracteres'),
  subtitle: z.string().max(300, 'Máximo 300 caracteres').optional().or(z.literal('')),
  releaseYear: z.coerce.number().min(1900).max(2100).optional().or(z.nan()),
  genreIds: z.array(z.string()).optional(),
});

export type SongFormData = z.infer<typeof songFormSchema>;
