'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

const statusFilters = [
  { value: '', label: 'Todos' },
  { value: 'registration', label: 'Inscripciones Abiertas' },
  { value: 'active', label: 'En Curso' },
  { value: 'completed', label: 'Completados' },
];

const formatFilters = [
  { value: '', label: 'Todos' },
  { value: 'americano', label: 'Americano' },
  { value: 'knockout', label: 'Eliminación' },
  { value: 'round_robin', label: 'Round Robin' },
];

interface TournamentFiltersProps {
  currentStatus?: string;
  currentFormat?: string;
}

export function TournamentFilters({ currentStatus, currentFormat }: TournamentFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/t?${params.toString()}`);
  };

  return (
    <div className="space-y-4 mb-8">
      <div className="flex flex-wrap gap-2 justify-center">
        {statusFilters.map((filter) => (
          <button key={filter.value} onClick={() => updateFilter('status', filter.value)}>
            <Badge
              variant={(currentStatus || '') === filter.value ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-cult-gold hover:text-cult-black transition-colors font-oswald uppercase tracking-wider"
            >
              {filter.label}
            </Badge>
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {formatFilters.map((filter) => (
          <button key={filter.value} onClick={() => updateFilter('format', filter.value)}>
            <Badge
              variant={(currentFormat || '') === filter.value ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-cult-gold hover:text-cult-black transition-colors font-oswald uppercase tracking-wider text-xs"
            >
              {filter.label}
            </Badge>
          </button>
        ))}
      </div>
    </div>
  );
}
