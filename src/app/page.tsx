import Link from 'next/link';
import { Trophy, Users, Clock, ArrowRight, Play, Calendar, MapPin, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// CPAM Tournament Data
const FEATURED_TOURNAMENTS = [
  { 
    id: 1, 
    name: 'CPAM Fecha 4 — Varonil A', 
    venue: 'Padel Factory Satélite', 
    date: 'Sáb 22 Mar', 
    price: 450, 
    format: 'AMERICANO', 
    maxTeams: 24, 
    registered: 20, 
    emoji: '🏆',
    spotsLeft: 4
  },
  { 
    id: 2, 
    name: 'CPAM Fecha 4 — Varonil B', 
    venue: 'Padel Factory Satélite', 
    date: 'Sáb 22 Mar', 
    price: 400, 
    format: 'AMERICANO', 
    maxTeams: 24, 
    registered: 18, 
    emoji: '⚡',
    spotsLeft: 6
  },
  { 
    id: 3, 
    name: 'CPAM Fecha 4 — Mixto', 
    venue: 'Padel Factory Satélite', 
    date: 'Dom 23 Mar', 
    price: 500, 
    format: 'AMERICANO', 
    maxTeams: 16, 
    registered: 14, 
    emoji: '🔥',
    spotsLeft: 2
  },
  { 
    id: 4, 
    name: 'Americano Social Nocturno', 
    venue: 'Padel Co. Polanco', 
    date: 'Vie 28 Mar', 
    price: 350, 
    format: 'AMERICANO', 
    maxTeams: 16, 
    registered: 8, 
    emoji: '🌙',
    spotsLeft: 8
  },
  { 
    id: 5, 
    name: 'CPAM Fecha 5 — Varonil A', 
    venue: 'Urban Padel Interlomas', 
    date: 'Sáb 5 Abr', 
    price: 450, 
    format: 'AMERICANO', 
    maxTeams: 24, 
    registered: 6, 
    emoji: '🏆',
    spotsLeft: 18
  },
  { 
    id: 6, 
    name: 'Torneo Relámpago Femenil', 
    venue: 'Padel House Santa Fe', 
    date: 'Dom 6 Abr', 
    price: 400, 
    format: 'KNOCKOUT', 
    maxTeams: 16, 
    registered: 10, 
    emoji: '⚡',
    spotsLeft: 6
  },
];

export default function HomePage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cult-black via-cult-black to-cult-gold/10 px-4 py-24 sm:px-6 sm:py-32">
        <div className="mx-auto max-w-7xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-cult-gold/20 px-4 py-2 ring-1 ring-cult-gold/30 mb-8">
            <Trophy className="h-4 w-4 text-cult-gold" />
            <span className="text-sm text-cult-gold font-oswald uppercase tracking-wider">La orden ha comenzado</span>
          </div>
          
          <h1 className="text-5xl font-oswald font-bold tracking-tight text-cult-gold sm:text-7xl uppercase">
            EL CULTO
            <span className="block text-cult-cream">CONVOCA</span>
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-cult-light">
            Torneos de pádel que se sienten como una orden secreta. 
            Solo los elegidos comprenden la devoción al juego perfecto.
          </p>
          
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/register">
              <Button variant="primary" size="lg" className="bg-cult-gold text-cult-black hover:bg-cult-gold-light font-oswald font-bold tracking-wide uppercase">
                <Play className="h-4 w-4 mr-2" />
                Responde al Llamado
              </Button>
            </Link>
            <Link href="/t">
              <Button variant="outline" size="lg" className="font-oswald font-bold tracking-wide uppercase">
                Ver Torneos
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.cult.gold/10),transparent)]" />
          <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-cult-black shadow-xl shadow-cult-gold/5 ring-1 ring-cult-medium sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center" />
        </div>
      </section>

      {/* Featured Tournaments Section */}
      <section className="py-24 bg-cult-dark/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-oswald font-bold text-cult-gold sm:text-5xl uppercase tracking-wide">
              Los Elegidos del Mes
            </h2>
            <p className="mt-4 text-lg text-cult-light">
              Torneos CPAM — El circuito amateur más competitivo de México
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_TOURNAMENTS.map((tournament) => (
              <Card key={tournament.id} className="group hover:border-cult-gold transition-all hover:shadow-lg hover:shadow-cult-gold/10">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{tournament.emoji}</span>
                      <Badge variant="default" className="uppercase tracking-wider">
                        {tournament.format}
                      </Badge>
                    </div>
                    {tournament.spotsLeft <= 4 && (
                      <Badge variant="error" className="text-xs">
                        {tournament.spotsLeft} lugares
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-lg font-oswald font-bold text-cult-cream mb-3 uppercase tracking-wide group-hover:text-cult-gold transition-colors">
                    {tournament.name}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-cult-light">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{tournament.venue}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-cult-light">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{tournament.date}</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-cult-light mb-1">
                      <span>Inscritos</span>
                      <span>{tournament.registered}/{tournament.maxTeams}</span>
                    </div>
                    <div className="w-full bg-cult-medium rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          tournament.spotsLeft <= 4 ? 'bg-error' : 'bg-cult-gold'
                        }`}
                        style={{ width: `${(tournament.registered / tournament.maxTeams) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-cult-medium">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-cult-gold" />
                      <span className="text-cult-gold font-bold font-jetbrains text-lg">
                        ${tournament.price}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-cult-gold hover:text-cult-black hover:bg-cult-gold font-oswald uppercase tracking-wide">
                      Inscribirse
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/t">
              <Button variant="outline" size="lg" className="font-oswald font-bold tracking-wide uppercase">
                Ver Todos los Torneos
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-cult-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-oswald font-bold text-cult-gold sm:text-5xl uppercase tracking-wide">
              El Ritual
            </h2>
            <p className="mt-4 text-lg text-cult-light">
              Tres pasos para unirte a la orden
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center group hover:border-cult-gold transition-all">
              <CardContent className="p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cult-gold text-cult-black mb-6 text-2xl font-oswald font-bold">
                  1
                </div>
                <h3 className="text-xl font-oswald font-bold text-cult-cream mb-4 uppercase tracking-wide">
                  Descubre
                </h3>
                <p className="text-cult-light">
                  Explora los torneos disponibles y encuentra el que despierte tu devoción por el pádel.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center group hover:border-cult-gold transition-all">
              <CardContent className="p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cult-gold text-cult-black mb-6 text-2xl font-oswald font-bold">
                  2
                </div>
                <h3 className="text-xl font-oswald font-bold text-cult-cream mb-4 uppercase tracking-wide">
                  Inscríbete
                </h3>
                <p className="text-cult-light">
                  Completa tu iniciación con el pago seguro. Solo los comprometidos avanzan.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center group hover:border-cult-gold transition-all">
              <CardContent className="p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cult-gold text-cult-black mb-6 text-2xl font-oswald font-bold">
                  3
                </div>
                <h3 className="text-xl font-oswald font-bold text-cult-cream mb-4 uppercase tracking-wide">
                  Compite
                </h3>
                <p className="text-cult-light">
                  Demuestra tu devoción en la cancha. Solo los verdaderos creyentes trascienden.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-r from-cult-gold via-cult-gold-light to-cult-gold py-16 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center relative z-10">
          <h2 className="text-4xl font-oswald font-bold text-cult-black uppercase tracking-wide">
            ¿Listo para el Culto?
          </h2>
          <p className="mt-4 text-lg text-cult-black/80">
            La orden te llama. No todos son elegidos, pero tú puedes serlo.
          </p>
          <div className="mt-8">
            <Link href="/register">
              <Button variant="default" size="lg" className="bg-cult-black text-cult-gold hover:bg-cult-dark font-oswald font-bold tracking-wide uppercase text-lg px-8 py-4">
                <Trophy className="h-5 w-5 mr-2" />
                Unirse al Culto
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.cult.gold-dark/20),transparent_70%)]" />
      </section>
    </div>
  );
}