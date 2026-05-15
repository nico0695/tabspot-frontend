'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/features/auth/schemas';
import { showToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/useAuthStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import styles from './page.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { loginSupabase, isLoading, clearError } = useAuthStore();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setSubmitError(null);
    clearError();

    const result = await loginSupabase(data.email, data.password);

    if (result.success) {
      router.push('/');
    } else {
      const message = result.message ?? 'Error al iniciar sesión';
      showToast.error(message);
      setSubmitError(message);
    }
  };

  return (
    <Card className={styles.card}>
      <Card.Header>
        <h3>Iniciar sesión</h3>
      </Card.Header>
      <Card.Body>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
          {submitError && (
            <div className={styles.alert} role="alert">
              {submitError}
            </div>
          )}

          <Input
            variant="text"
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            variant="password"
            label="Contraseña"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />

          <Button
            variant="primary"
            size="md"
            type="submit"
            disabled={isLoading}
            className={styles.submitBtn}
          >
            {isLoading ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>

        <div className={styles.footer}>
          <Link href="/register" className={styles.link}>
            ¿No tenés cuenta? Registrate
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
}
