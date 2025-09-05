import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔧 Supabase URL:', supabaseUrl);
console.log('🔑 Supabase Key exists:', !!supabaseAnonKey);
console.log('🔑 Supabase Key preview:', supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'MISSING');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('URL missing:', !supabaseUrl);
  console.error('Key missing:', !supabaseAnonKey);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test the connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('❌ Supabase connection test failed:', error);
  } else {
    console.log('✅ Supabase connection test successful');
  }
});
// Auth helpers
export const signUp = async (email, password) => {
  console.log('📝 Attempting sign up for:', email);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  if (error) console.error('❌ Sign up error:', error);
  else console.log('✅ Sign up successful');
  return { data, error }
}

export const signIn = async (email, password) => {
  console.log('🔐 Attempting sign in for:', email);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) console.error('❌ Sign in error:', error);
  else console.log('✅ Sign in successful');
  return { data, error }
}

export const signOut = async () => {
  console.log('👋 Attempting sign out');
  const { error } = await supabase.auth.signOut()
  if (error) console.error('❌ Sign out error:', error);
  else console.log('✅ Sign out successful');
  return { error }
}

export const getCurrentUser = async () => {
  console.log('👤 Getting current user...');
  const { data: { user } } = await supabase.auth.getUser()
  console.log('👤 Current user result:', user?.email || 'No user');
  return user
}

// Task helpers
export const getTasks = async () => {
  const user = await getCurrentUser();
  if (!user) {
    console.warn('No user found when fetching tasks');
    return { data: [], error: null };
  }
  
  console.log('Fetching tasks for user:', user.id);
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  
  console.log('Tasks fetched:', data?.length || 0, 'tasks');
  return { data, error }
}

export const addTask = async (text, priority = 'medium') => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User must be authenticated to add tasks');
  }
  
  if (!text || text.trim() === '') {
    throw new Error('Task text cannot be empty');
  }
  
  const { data, error } = await supabase
    .from('tasks')
    .insert([
      {
        text: text.trim(),
        priority,
        user_id: user.id
      }
    ])
    .select()
  
  return { data, error }
}

export const updateTask = async (id, updates) => {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
  
  return { data, error }
}

export const deleteTask = async (id) => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
  
  return { error }
}