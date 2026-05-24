import * as z from 'zod';

export const tabFormSchema = z.object({
  songId: z.string().min(1, 'La canción es obligatoria'),
  content: z.string().min(1, 'El contenido es obligatorio'),
  tabType: z.string().min(1, 'El tipo es obligatorio'),
  instrument: z.string().min(1, 'El instrumento es obligatorio'),
  difficulty: z.string().min(1, 'La dificultad es obligatoria'),
  titleOverride: z.string().max(300, 'Máximo 300 caracteres').optional().or(z.literal('')),
  status: z.string().optional(),
  moderationNotes: z.string().max(2000, 'Máximo 2000 caracteres').optional().or(z.literal('')),
});

export type TabFormData = z.infer<typeof tabFormSchema>;
