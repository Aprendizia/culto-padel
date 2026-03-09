'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { create } from 'zustand';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'info';
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  add: (toast: Omit<Toast, 'id'>) => void;
  remove: (id: string) => void;
}

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  add: (toast) => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, toast.duration || 4000);
  },
  remove: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

const icons = {
  default: null,
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const colors = {
  default: 'border-zinc-700',
  success: 'border-emerald-500/50',
  error: 'border-red-500/50',
  info: 'border-blue-500/50',
};

export function ToastContainer() {
  const { toasts, remove } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = icons[toast.variant || 'default'];
        return (
          <div
            key={toast.id}
            className={cn(
              'flex items-start gap-3 rounded-lg border bg-zinc-900 p-4 shadow-xl animate-in slide-in-from-right-5 min-w-[300px] max-w-[420px]',
              colors[toast.variant || 'default']
            )}
          >
            {Icon && <Icon className="h-5 w-5 mt-0.5 shrink-0 text-zinc-300" />}
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-100">{toast.title}</p>
              {toast.description && (
                <p className="mt-1 text-xs text-zinc-400">{toast.description}</p>
              )}
            </div>
            <button onClick={() => remove(toast.id)} className="text-zinc-500 hover:text-zinc-300">
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

// Helper function
export function toast(props: Omit<Toast, 'id'>) {
  useToast.getState().add(props);
}
