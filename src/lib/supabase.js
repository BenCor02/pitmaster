import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Mock complet quand les vars d'env sont absentes — évite tout crash
const mockClient = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => ({ error: { message: 'Supabase non configuré' }, data: null }),
    signUp: async () => ({ error: { message: 'Supabase non configuré' }, data: null }),
    signOut: async () => {},
    getUser: async () => ({ data: { user: null }, error: null }),
  },
  from: () => ({
    select: function() { return this },
    insert: function() { return this },
    update: function() { return this },
    delete: function() { return this },
    upsert: function() { return this },
    eq: function() { return this },
    neq: function() { return this },
    in: function() { return this },
    contains: function() { return this },
    order: function() { return this },
    limit: function() { return this },
    single: async () => ({ data: null, error: null }),
    maybeSingle: async () => ({ data: null, error: null }),
    then: (resolve) => resolve({ data: [], error: null }),
  }),
  storage: { from: () => ({ upload: async () => ({}) }) },
  rpc: async () => ({ data: null, error: null }),
}

export const supabase = (url && key)
  ? createClient(url, key, {
      auth: {
        persistSession: typeof window !== 'undefined',
        autoRefreshToken: typeof window !== 'undefined',
        detectSessionInUrl: typeof window !== 'undefined',
      },
    })
  : mockClient
