'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '@/features/auth/schemas';
import { showToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/useAuthStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import styles from './page.module.css';

export default function RegisterPage() {
  const { registerSupabase, isLoading, clearError } = useAuthStore();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setSubmitError(null);
    setSuccess(false);
    clearError();

    const result = await registerSupabase(data.email, data.password);

    if (result.success) {
      setSuccess(true);
    } else {
      const message = result.message ?? 'Error al registrarse';
      showToast.error(message);
      setSubmitError(message);
    }
  };

  if (success) {
    return (
      <Card className={styles.card}>
        <Card.Header>
          <h3>Registro exitoso</h3>
        </Card.Header>
        <Card.Body>
          <p className={styles.successMessage}>
            Registro exitoso. Revisá tu email para confirmar tu cuenta.
          </p>
          <div className={styles.footer}>
            <Link href="/login" className={styles.link}>
              Ir a iniciar sesión
            </Link>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className={styles.card}>
      <Card.Header>
        <h3>Registrarse</h3>
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
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />

          <Input
            variant="password"
            label="Confirmar contraseña"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button
            variant="primary"
            size="md"
            type="submit"
            disabled={isLoading}
            className={styles.submitBtn}
          >
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </Button>
        </form>

        <div className={styles.footer}>
          <Link href="/login" className={styles.link}>
            ¿Ya tenés cuenta? Ingresá
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
}
