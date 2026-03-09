import Link from 'next/link';
import { Trophy, Users, Zap, Star, ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-emerald-950/20 px-4 py-24 sm:px-6 sm:py-32">
        <div className="mx-auto max-w-7xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 ring-1 ring-emerald-500/20 mb-6">
            <Star className="h-4 w-4 text-emerald-400" />
            <span className="text-sm text-emerald-400">La plataforma #1 para torneos de pádel</span>
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight text-zinc-100 sm:text-6xl">
            Organiza torneos de pádel
            <span className="block text-emerald-400">como un profesional</span>
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
            Culto Pádel es la plataforma todo-en-uno para clubes que quieren gestionar inscripciones, 
            generar brackets automáticamente y cobrar de forma segura.
          </p>
          
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/register">
              <Button variant="primary" size="lg">
                <Play className="h-4 w-4 mr-2" />
                Empezar gratis
              </Button>
            </Link>
            <Link href="/tournaments">
              <Button variant="outline" size="lg">
                Ver torneos públicos
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.emerald.500/20),transparent)]" />
          <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-zinc-950 shadow-xl shadow-emerald-600/10 ring-1 ring-zinc-800 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center" />
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-zinc-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-zinc-100 sm:text-4xl">
              Todo lo que necesitas para gestionar tu club
            </h2>
            <p className="mt-4 text-lg text-zinc-400">
              Desde inscripciones hasta pagos, lo tenemos cubierto
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 mb-4">
                  <Trophy className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-100 mb-2">Brackets Automáticos</h3>
                <p className="text-zinc-400">
                  Genera brackets de eliminación directa, americano y más formatos con un clic. 
                  Seeding inteligente y balanceado.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 mb-4">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-100 mb-2">Inscripciones Fáciles</h3>
                <p className="text-zinc-400">
                  Los jugadores se inscriben online. Gestiona listas de espera, confirmaciones 
                  y comunicación automática.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 mb-4">
                  <Zap className="h-6 w-6 text-amber-400" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-100 mb-2">Pagos con Stripe</h3>
                <p className="text-zinc-400">
                  Cobra cuotas de inscripción de forma segura. Stripe Connect te permite 
                  recibir pagos directamente en tu cuenta.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-emerald-600 to-emerald-700 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-white">
            ¿Listo para modernizar tu club?
          </h2>
          <p className="mt-4 text-lg text-emerald-100">
            Únete a los clubes que ya confían en Culto Pádel para sus torneos
          </p>
          <div className="mt-8">
            <Link href="/register">
              <Button variant="default" size="lg" className="bg-white text-emerald-600 hover:bg-zinc-100">
                Empezar gratis hoy
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}