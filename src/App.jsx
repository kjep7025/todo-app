import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./lib/supabase";
import AuthForm from "./components/AuthForm";
import Navigation from "./components/Navigation";
import TodoPage from "./pages/TodoPage";
import CompletedPage from "./pages/CompletedPage";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setError(`Authentication error: ${error.message}`);
        } else if (session?.user) {
          setUser(session.user);
          await loadTasks(session.user.id);
        }
      } catch (err) {
        console.error('Failed to check session:', err);
        setError(`Failed to initialize: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (session?.user) {
        setUser(session.user);
        setError(null);
        await loadTasks(session.user.id);
      } else {
        setUser(null);
        setTasks([]);
      }
      setLoading(false);
    });

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
        setError(`Failed to load tasks: ${error.message}`);
        return;
      }

      setTasks(data || []);
      console.log('Loaded tasks:', data?.length || 0);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setError(`Failed to load tasks: ${err.message}`);
    }
  };

  const handleAuthSuccess = (user) => {
    setUser(user);
    setError(null);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setTasks([]);
      setError(null);
    } catch (error) {
      console.error('Error signing out:', error);
      setError(`Logout failed: ${error.message}`);
    }
  };

  const addTask = async (taskText, priority = 'medium') => {
    if (!taskText?.trim()) return;
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          text: taskText.trim(),
          priority,
          user_id: user.id,
          completed: false
        }])
        .select()
        .single();

      if (error) throw error;
      
      setTasks(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error adding task:', error);
      setError(`Failed to add task: ${error.message}`);
    }
  };

  const toggleTask = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const updates = {
        completed: !task.completed,
        completed_at: !task.completed ? new Date().toISOString() : null
      };

      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, ...updates } : t
      ));
    } catch (error) {
      console.error('Error toggling task:', error);
      setError(`Failed to update task: ${error.message}`);
    }
  };

  const removeTask = async (taskId) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Error removing task:', error);
      setError(`Failed to delete task: ${error.message}`);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="loading">
        <div>Initializing app...</div>
        {error && (
          <div style={{ 
            color: '#ef4444', 
            marginTop: '15px', 
            padding: '10px', 
            background: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '6px',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            maxWidth: '400px'
          }}>
            <strong>Error:</strong> {error}
            <br />
            <small>Please refresh the page or check your internet connection.</small>
          </div>
        )}
      </div>
    );
  }

  // Show auth form if no user
  if (!user) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} error={error} />;
  }

  // Main app
  return (
    <div className="app-container">
      {error && (
        <div style={{ 
          color: '#ef4444', 
          marginBottom: '20px', 
          padding: '10px', 
          background: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '6px',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          textAlign: 'center'
        }}>
          <strong>Warning:</strong> {error}
          <button 
            onClick={() => setError(null)}
            style={{ marginLeft: '10px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}
      
      <Navigation username={user.email} onLogout={handleLogout} />
      
      <Routes>
        <Route path="/" element={<Navigate to="/todo" replace />} />
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
      </Routes>
    </div>
  );
}

export default App;