import { toast } from 'sonner';

export const showToast = {
  success: (message: string) => toast.success(message, { duration: 4000 }),
  error: (message: string) => toast.error(message, { duration: 6000 }),
  warning: (message: string) => toast.warning(message, { duration: 6000 }),
  info: (message: string) => toast.info(message, { duration: 4000 }),
};
