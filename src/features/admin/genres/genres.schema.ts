import * as z from 'zod';

export const genreFormSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(100, 'Máximo 100 caracteres'),
});

export type GenreFormData = z.infer<typeof genreFormSchema>;
