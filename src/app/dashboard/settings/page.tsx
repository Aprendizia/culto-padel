import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Building2, Palette, Bell, Shield } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Configuración</h1>
        <p className="text-zinc-400 mt-1">Administra la configuración de tu club</p>
      </div>

      {/* Club Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Información del Club
          </CardTitle>
          <CardDescription>Datos básicos de tu organización</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nombre del club" defaultValue="Club de Pádel Elite" />
            <Input label="Email de contacto" type="email" defaultValue="info@clubelite.com" />
          </div>
          <Input label="Descripción" defaultValue="El mejor club de pádel de la ciudad" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Teléfono" defaultValue="+52 55 1234 5678" />
            <Input label="Ciudad" defaultValue="Ciudad de México" />
            <Input label="Código postal" defaultValue="03100" />
          </div>
          <Button variant="primary">Guardar cambios</Button>
        </CardContent>
      </Card>

      {/* Stripe Connect */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Pagos con Stripe
          </CardTitle>
          <CardDescription>Configura los pagos para inscripciones y productos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50">
            <div>
              <p className="font-medium text-zinc-100">Estado de la cuenta</p>
              <p className="text-sm text-zinc-400">Conecta tu cuenta de Stripe para recibir pagos</p>
            </div>
            <Badge variant="warning">Pendiente</Badge>
          </div>
          <Button variant="primary">Conectar con Stripe</Button>
        </CardContent>
      </Card>

      {/* Brand Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Personalización
          </CardTitle>
          <CardDescription>Colores y branding del club</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-zinc-300 mb-2 block">Color principal</label>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-emerald-500" />
                <Input defaultValue="#10b981" className="flex-1" />
              </div>
            </div>
            <div>
              <label className="text-sm text-zinc-300 mb-2 block">Color secundario</label>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-blue-500" />
                <Input defaultValue="#3b82f6" className="flex-1" />
              </div>
            </div>
            <div>
              <label className="text-sm text-zinc-300 mb-2 block">Color de acento</label>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-amber-500" />
                <Input defaultValue="#f59e0b" className="flex-1" />
              </div>
            </div>
            <div>
              <label className="text-sm text-zinc-300 mb-2 block">Fondo</label>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-zinc-900 border border-zinc-700" />
                <Input defaultValue="#18181b" className="flex-1" />
              </div>
            </div>
          </div>
          <Button variant="primary">Aplicar colores</Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones
          </CardTitle>
          <CardDescription>Configura las notificaciones automáticas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-zinc-100">Recordatorio de torneos</p>
                <p className="text-sm text-zinc-400">Enviar recordatorio 24h antes</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-zinc-100">Confirmación de pago</p>
                <p className="text-sm text-zinc-400">Notificar cuando se confirme el pago</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-zinc-100">Resultados de partidos</p>
                <p className="text-sm text-zinc-400">Enviar resultados a participantes</p>
              </div>
              <input type="checkbox" className="rounded" />
            </div>
          </div>
          <Button variant="primary">Guardar preferencias</Button>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Seguridad
          </CardTitle>
          <CardDescription>Configuración de seguridad y permisos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline">Cambiar contraseña</Button>
          <Button variant="outline">Gestionar permisos</Button>
        </CardContent>
      </Card>
    </div>
  );
}