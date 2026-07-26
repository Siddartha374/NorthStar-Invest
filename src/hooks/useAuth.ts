import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";
import { DEMO_PROFILE } from "@/lib/demoData";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(!isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setDemoMode(true);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (demoMode) return { error: null };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    if (demoMode) return { error: null };
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  };

  const signOut = async () => {
    if (demoMode) {
      setDemoMode(false);
      return;
    }
    await supabase.auth.signOut();
  };

  const enterDemoMode = () => {
    setDemoMode(true);
    setUser({ id: DEMO_PROFILE.id, email: "demo@northstar.invest" } as User);
  };

  return {
    user: demoMode ? ({ id: DEMO_PROFILE.id, email: "demo@northstar.invest" } as User) : user,
    session,
    loading,
    demoMode,
    signIn,
    signUp,
    signOut,
    enterDemoMode,
    isAuthenticated: demoMode || !!user,
  };
}
