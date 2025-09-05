import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import AuthForm from './components/AuthForm';
import Navigation from './components/Navigation';
import TodoPage from './pages/TodoPage';
import CompletedPage from './pages/CompletedPage';
import './components/Button.css';
import './pages/Pages.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session error:', error);
          setAuthError('Failed to get session');
        } else {
          setUser(session?.user ?? null);
          if (session?.user) {
            await loadTasks(session.user.id);
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
        setAuthError('Connection failed');
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setUser(session?.user ?? null);
        setAuthError('');
        
        if (session?.user) {
          await loadTasks(session.user.id);
        } else {
          setTasks([]);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadTasks = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading tasks:', error);
        setAuthError('Failed to load tasks');
      } else {
        setTasks(data || []);
      }
    } catch (error) {
      console.error('Load tasks failed:', error);
      setAuthError('Failed to load tasks');
    }
  };

  const handleAuthSuccess = async (user) => {
    setUser(user);
    setAuthError('');
    await loadTasks(user.id);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setTasks([]);
      setAuthError('');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const addTask = async (text, priority) => {
    if (!user) return;

    try {
      const newTask = {
        user_id: user.id,
        text: text.trim(),
        priority,
        completed: false,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([newTask])
        .select()
        .single();

      if (error) {
        console.error('Error adding task:', error);
        setAuthError('Failed to add task');
      } else {
        setTasks(prev => [data, ...prev]);
      }
    } catch (error) {
      console.error('Add task failed:', error);
      setAuthError('Failed to add task');
    }
  };

  const toggleTask = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedTask = {
      completed: !task.completed,
      completed_at: !task.completed ? new Date().toISOString() : null
    };

    try {
      const { error } = await supabase
        .from('tasks')
        .update(updatedTask)
        .eq('id', taskId);

      if (error) {
        console.error('Error updating task:', error);
        setAuthError('Failed to update task');
      } else {
        setTasks(prev => prev.map(t => 
          t.id === taskId 
            ? { ...t, ...updatedTask }
            : t
        ));
      }
    } catch (error) {
      console.error('Toggle task failed:', error);
      setAuthError('Failed to update task');
    }
  };

  const removeTask = async (taskId) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error('Error deleting task:', error);
        setAuthError('Failed to delete task');
      } else {
        setTasks(prev => prev.filter(t => t.id !== taskId));
      }
    } catch (error) {
      console.error('Delete task failed:', error);
      setAuthError('Failed to delete task');
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        color: 'var(--text-primary)'
      }}>
        <div>
          <h2>Loading...</h2>
          <p>Connecting to your tasks...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} error={authError} />;
  }

  return (
    <div style={{ minHeight: '100vh', padding: '20px' }}>
      <Navigation 
        username={user.email} 
        onLogout={handleLogout} 
      />
      
      {authError && (
        <div style={{
          background: 'rgba(220, 53, 69, 0.1)',
          color: '#dc3545',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          {authError}
        </div>
      )}

      <Routes>
        <Route 
          path="/todo" 
          element={
            <TodoPage 
              tasks={tasks}
              onAddTask={addTask}
              onToggleTask={toggleTask}
              onRemoveTask={removeTask}
            />
          } 
        />
        <Route 
          path="/completed" 
          element={
            <CompletedPage 
              tasks={tasks}
              onToggleTask={toggleTask}
              onRemoveTask={removeTask}
            />
          } 
        />
        <Route path="/" element={<Navigate to="/todo" replace />} />
      </Routes>
    </div>
  );
}

export default App;