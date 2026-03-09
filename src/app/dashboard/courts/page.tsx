import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, MapPin, Settings } from 'lucide-react';

export default function CourtsPage() {
  // Mock data - in real app, fetch from API
  const courts = [
    {
      id: '1',
      name: 'Cancha 1',
      type: 'indoor',
      surface: 'artificial_grass',
      status: 'available',
      hasLighting: true,
      hasRoof: true,
    },
    {
      id: '2',
      name: 'Cancha 2',
      type: 'outdoor',
      surface: 'concrete',
      status: 'maintenance',
      hasLighting: false,
      hasRoof: false,
    },
    {
      id: '3',
      name: 'Cancha Central',
      type: 'covered',
      surface: 'panoramic',
      status: 'available',
      hasLighting: true,
      hasRoof: true,
    },
  ];

  const statusConfig = {
    available: { label: 'Disponible', variant: 'success' as const },
    maintenance: { label: 'Mantenimiento', variant: 'warning' as const },
    reserved: { label: 'Reservada', variant: 'info' as const },
    inactive: { label: 'Inactiva', variant: 'error' as const },
  };

  const typeLabels = {
    indoor: 'Interior',
    outdoor: 'Exterior',
    covered: 'Techada',
  };

  const surfaceLabels = {
    artificial_grass: 'Césped artificial',
    concrete: 'Concreto',
    panoramic: 'Panorámica',
    carpet: 'Alfombra',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Canchas</h1>
          <p className="text-zinc-400 mt-1">Gestiona las canchas de tu club</p>
        </div>
        <Button variant="primary">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Cancha
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courts.map((court) => (
          <Card key={court.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-400" />
                  {court.name}
                </CardTitle>
                <Badge variant={statusConfig[court.status as keyof typeof statusConfig].variant}>
                  {statusConfig[court.status as keyof typeof statusConfig].label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-zinc-400">Tipo</p>
                  <p className="text-zinc-100 font-medium">
                    {typeLabels[court.type as keyof typeof typeLabels]}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-400">Superficie</p>
                  <p className="text-zinc-100 font-medium">
                    {surfaceLabels[court.surface as keyof typeof surfaceLabels]}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {court.hasLighting && <Badge variant="info">Iluminación</Badge>}
                {court.hasRoof && <Badge variant="info">Techada</Badge>}
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Settings className="h-3 w-3 mr-1" />
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}