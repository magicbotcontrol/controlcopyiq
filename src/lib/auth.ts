import { supabase } from './supabase';
import { AccessLevel, UserAuth } from '../types';

interface SignUpInput {
  email: string;
  password: string;
  nome: string;
  level: AccessLevel;
}

function normalizeUserAuth(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}): UserAuth {
  return {
    id: user.id,
    email: user.email || '',
    nome: String(user.user_metadata?.nome || user.email?.split('@')[0] || 'Operador'),
    level: (user.user_metadata?.level as AccessLevel) || 'Admin',
  };
}

export async function getCurrentSessionUser() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return session?.user ?? null;
}

export async function getCurrentAuthProfile(): Promise<UserAuth | null> {
  const sessionUser = await getCurrentSessionUser();

  if (!sessionUser) {
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, nome, level')
    .eq('id', sessionUser.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return normalizeUserAuth(sessionUser);
  }

  return {
    id: data.id,
    email: data.email,
    nome: data.nome,
    level: data.level as AccessLevel,
  };
}

export async function signInWithEmail(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    throw error;
  }

  return getCurrentAuthProfile();
}

export async function signUpWithEmail(input: SignUpInput) {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo: window.location.origin,
      data: {
        nome: input.nome,
        level: input.level,
      },
    },
  });

  if (error) {
    throw error;
  }

  return {
    user: data.user,
    session: data.session,
  };
}

export async function sendPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin,
  });

  if (error) {
    throw error;
  }
}

export async function signOutCurrentUser() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export function subscribeToAuthChanges(callback: (auth: UserAuth | null) => void) {
  return supabase.auth.onAuthStateChange(async (_event, session) => {
    if (!session?.user) {
      callback(null);
      return;
    }

    try {
      const profile = await getCurrentAuthProfile();
      callback(profile);
    } catch {
      callback(normalizeUserAuth(session.user));
    }
  });
}
