'use client';

import { createContext, useContext } from 'react';
import type { TenantConfig } from '@/types/database';

interface TenantContextType {
  tenant: TenantConfig | null;
}

const TenantContext = createContext<TenantContextType>({ tenant: null });

export function TenantProvider({ tenant, children }: { tenant: TenantConfig | null; children: React.ReactNode }) {
  return (
    <TenantContext.Provider value={{ tenant }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  return useContext(TenantContext);
}
