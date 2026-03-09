import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      <Navbar user={user ? { email: user.email!, name: user.user_metadata?.full_name } : null} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}