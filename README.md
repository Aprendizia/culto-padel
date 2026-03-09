# Culto Pádel

Una plataforma SaaS multi-tenant para clubes de pádel que permite organizar torneos, gestionar inscripciones, generar brackets automáticamente y procesar pagos de forma segura.

## 🏆 Características

- **Multi-tenant**: Cada club tiene su propio espacio aislado
- **Gestión de Torneos**: Soporte para múltiples formatos (Americano, Knockout, Round Robin, etc.)
- **Brackets Automáticos**: Generación inteligente con seeding balanceado
- **Pagos con Stripe Connect**: Comisiones automáticas y pagos directos al club
- **Sistema de Inscripciones**: Online con confirmación automática
- **Clasificaciones en Tiempo Real**: Rankings y estadísticas actualizadas
- **Notificaciones**: Email y WhatsApp para recordatorios
- **Multi-idioma**: Interfaz en español con soporte futuro para otros idiomas

## 🛠 Tech Stack

### Frontend
- **Next.js 14** con App Router
- **TypeScript** strict mode
- **Tailwind CSS** para estilos
- **Lucide React** para iconos
- **Zustand** para estado global

### Backend
- **Supabase** (PostgreSQL + Auth + Real-time)
- **Row Level Security (RLS)** para multi-tenancy
- **Next.js API Routes** para lógica de negocio

### Pagos
- **Stripe Connect** con destination charges
- **Webhooks** para confirmación automática
- **Comisiones configurables** por plan

### Algoritmos de Torneos
- **Bracket Generator**: Eliminación directa con BYEs automáticos
- **Americano Engine**: Rotación de parejas sin repetición
- **Standings Calculator**: Rankings con múltiples criterios

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── (auth)/                 # Login/Register
│   ├── (dashboard)/            # Panel de administración
│   ├── (public)/               # Páginas públicas
│   └── api/                    # API routes
├── components/
│   ├── ui/                     # Componentes base (shadcn-style)
│   ├── layout/                 # Headers, sidebars, footers
│   └── tournaments/            # Componentes específicos de torneos
├── lib/
│   ├── stripe/                 # Integración de Stripe
│   ├── supabase/              # Clients y utilidades
│   └── tournaments/           # Algoritmos de torneos
├── hooks/                     # React hooks personalizados
├── types/                     # TypeScript types
└── middleware.ts              # Auth + tenant resolution
```

## 🚀 Setup Local

### 1. Clonar e Instalar

```bash
git clone [repo-url]
cd culto-padel
npm install
```

### 2. Variables de Entorno

Copia `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Configura las variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Base de Datos

La migración inicial está en `supabase/migrations/001_initial_schema.sql`.

Si usas Supabase local:
```bash
supabase start
supabase db reset
```

Si usas Supabase cloud, ejecuta el SQL en el dashboard.

### 4. Ejecutar

```bash
npm run dev
```

Visita `http://localhost:3000`

## 🏗 Arquitectura

### Multi-Tenancy
- Cada club es un "tenant" con su propio `tenant_id`
- RLS automático en todas las tablas con `tenant_id`
- Resolución de tenant via subdominio o dominio custom
- Middleware de Next.js para enrutamiento

### Stripe Connect Flow
1. **Club**: Crea cuenta Connect → Onboarding → Configuración completa
2. **Jugador**: Se inscribe → Checkout Session con `destination_charges`
3. **Plataforma**: Retiene comisión automáticamente
4. **Club**: Recibe pago neto directo en su cuenta

### Algoritmos de Torneos

#### Bracket Generator (Knockout)
- Padding a potencia de 2 con BYEs
- Seeding estándar: 1v8, 4v5, 2v7, 3v6
- Links automáticos: `next_match_id`, `next_match_slot`
- Walkovers automáticos para BYEs

#### Americano Engine
- Genera todas las combinaciones de parejas
- Algoritmo greedy para evitar repeticiones
- Balanceo de partidos por jugador
- Soporte para sit-outs cuando número impar

#### Standings Calculator
- Scoring individual (Americano) o por equipo
- Ordenamiento: `total_points DESC, point_diff DESC, matches_won DESC`
- Bonus points configurables
- Actualización en tiempo real

## 📊 Schema de Base de Datos

### Tablas Principales
- `tenants`: Clubes (con Stripe Connect)
- `profiles`: Usuarios extendidos de Supabase Auth
- `tournaments`: Torneos con configuración
- `tournament_registrations`: Inscripciones con pagos
- `matches`: Partidos con scores y brackets
- `standings`: Rankings calculados

### Enums
- `tournament_format`: Formatos soportados
- `tournament_status`: Estados del torneo
- `payment_status`: Estados de pago
- `user_role`: Roles y permisos

## 🔐 Seguridad

- **RLS**: Aislamiento automático por tenant
- **Auth Middleware**: Protección de rutas
- **Role-based Access**: `tenant_owner`, `tenant_admin`, `player`
- **Stripe Webhooks**: Verificación de signature
- **Type Safety**: TypeScript en todo el stack

## 🚢 Deployment

### Vercel (Recomendado)

1. Conecta el repo en Vercel
2. Configura las variables de entorno
3. Deploy automático

### Otras Plataformas

Compatible con cualquier host que soporte Next.js:
- Railway
- Render
- DigitalOcean App Platform

## 🎨 Personalización

### Temas
Los clubes pueden personalizar colores en `/dashboard/settings`:
- Color primario
- Color secundario  
- Color de acento
- Fondo

### Formatos de Torneo
Agregar nuevos formatos en:
1. `types/database.ts` → enum `tournament_format`
2. `lib/tournaments/` → algoritmo específico
3. `api/tournaments/[id]/bracket/route.ts` → integración

### Notificaciones
Sistema extensible en `components/ui/toast.tsx` y tablas de `notifications`.

## 📈 Roadmap

- [ ] WhatsApp API integration
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Live streaming integration
- [ ] Multi-language support
- [ ] Court booking system
- [ ] Inventory management

## 🤝 Contribuir

1. Fork el repo
2. Crea feature branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Abre Pull Request

## 📄 Licencia

MIT License. Ver `LICENSE` para más detalles.

## 🆘 Soporte

- 📧 Email: soporte@cultopadel.com
- 💬 Discord: [Culto Pádel Community](https://discord.gg/cultopadel)
- 📖 Docs: [docs.cultopadel.com](https://docs.cultopadel.com)

---

**Hecho con ❤️ para la comunidad de pádel**