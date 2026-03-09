'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/components/ui/toast';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'error' });
      setLoading(false);
      return;
    }

    router.push(redirect);
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Iniciar sesión</CardTitle>
        <CardDescription>Ingresa a tu cuenta de Culto Pádel</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Correo electrónico"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
            Iniciar sesión
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-cult-light">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-cult-gold hover:underline">
            Regístrate
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse bg-cult-dark rounded-xl" />}>
      <LoginForm />
    </Suspense>
  );
}
