'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/components/providers/supabase-provider';
import { useTenant } from '@/hooks/use-tenant';
import type { User } from '@supabase/supabase-js';
import type { User as AppUser, TenantMembership } from '@/types/database';

export function useAuth() {
  const { supabase } = useSupabase();
  const { tenant } = useTenant();
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [membership, setMembership] = useState<TenantMembership | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);

      if (authUser) {
        // Fetch global user profile
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();
        setAppUser(userData);

        // Fetch tenant membership if tenant context exists
        if (tenant?.id) {
          const { data: membershipData } = await supabase
            .from('tenant_memberships')
            .select('*')
            .eq('user_id', authUser.id)
            .eq('tenant_id', tenant.id)
            .single();
          setMembership(membershipData);
        }
      }
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setAppUser(userData);

          if (tenant?.id) {
            const { data: membershipData } = await supabase
              .from('tenant_memberships')
              .select('*')
              .eq('user_id', session.user.id)
              .eq('tenant_id', tenant.id)
              .single();
            setMembership(membershipData);
          }
        } else {
          setAppUser(null);
          setMembership(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, tenant?.id]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, metadata?: Record<string, unknown>) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAppUser(null);
    setMembership(null);
  };

  const isAdmin = membership?.role && ['super_admin', 'tenant_owner', 'tenant_admin'].includes(membership.role);

  // Keep backward compat: expose profile as alias for appUser
  return { user, profile: appUser, appUser, membership, loading, isAdmin, signIn, signUp, signOut };
}
