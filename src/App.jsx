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
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState([]);

  const addDebugInfo = (message) => {
    console.log('DEBUG:', message);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        addDebugInfo('Starting app initialization...');
        
        // Check environment variables
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        addDebugInfo(`Supabase URL: ${supabaseUrl ? 'Present' : 'Missing'}`);
        addDebugInfo(`Supabase Key: ${supabaseKey ? 'Present' : 'Missing'}`);
        
        if (!supabaseUrl || !supabaseKey) {
          throw new Error('Missing Supabase environment variables');
        }

        addDebugInfo('Testing Supabase connection...');
        
        // Test connection with timeout
        const connectionTest = supabase
          .from('tasks')
          .select('count', { count: 'exact', head: true });
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000)
        );
        
        await Promise.race([connectionTest, timeoutPromise]);
        addDebugInfo('Supabase connection successful');

        // Get session
        addDebugInfo('Getting user session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          addDebugInfo(`Session error: ${sessionError.message}`);
          throw sessionError;
        }
        
        addDebugInfo(`Session: ${session ? 'Found' : 'None'}`);
        
        if (session?.user) {
          setUser(session.user);
          addDebugInfo(`User: ${session.user.email}`);
          await loadTasks(session.user.id);
        }
        
        addDebugInfo('App initialization complete');
        
      } catch (error) {
        addDebugInfo(`Error: ${error.message}`);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        addDebugInfo(`Auth event: ${event}`);
        setUser(session?.user ?? null);
        setError('');
        
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
      addDebugInfo(`Loading tasks for user: ${userId}`);
      
      // Add timeout to prevent hanging
      const taskQuery = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Task loading timeout after 10 seconds')), 10000)
      );
      
      const { data, error } = await Promise.race([taskQuery, timeoutPromise]);

      if (error) {
        addDebugInfo(`Task loading error: ${error.message}`);
        throw error;
      }
      
      addDebugInfo(`Loaded ${data?.length || 0} tasks`);
      addDebugInfo(`Task loading completed successfully`);
      setTasks(data || []);
    } catch (error) {
      addDebugInfo(`Load tasks failed: ${error.message}`);
      // Don't show error for timeout, just continue with empty tasks
      if (error.message.includes('timeout')) {
        addDebugInfo('Task loading timed out, continuing with empty task list');
        setTasks([]);
      } else {
        setError(`Failed to load tasks: ${error.message}`);
      }
    }
  };

  const handleAuthSuccess = async (user) => {
    addDebugInfo(`Auth success: ${user.email}`);
    setUser(user);
    setError('');
    await loadTasks(user.id);
  };

  const handleLogout = async () => {
    try {
      addDebugInfo('Logging out...');
      await supabase.auth.signOut();
      setUser(null);
      setTasks([]);
      setError('');
      addDebugInfo('Logout successful');
    } catch (error) {
      addDebugInfo(`Logout error: ${error.message}`);
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

      if (error) throw error;
      setTasks(prev => [data, ...prev]);
    } catch (error) {
      setError(`Failed to add task: ${error.message}`);
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

      if (error) throw error;
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, ...updatedTask } : t
      ));
    } catch (error) {
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
      setError(`Failed to delete task: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        color: 'var(--text-primary)',
        padding: '20px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2>Loading...</h2>
          <p>Connecting to your tasks...</p>
        </div>
        
        {error && (
          <div style={{
            background: 'rgba(220, 53, 69, 0.1)',
            color: '#dc3545',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px',
            width: '100%',
            textAlign: 'center',
            border: '1px solid rgba(220, 53, 69, 0.3)'
          }}>
            <strong>Connection Error:</strong><br />
            {error}
          </div>
        )}
        
        <div style={{
          background: 'var(--bg-secondary)',
          padding: '16px',
          borderRadius: '8px',
          width: '100%',
          maxHeight: '300px',
          overflow: 'auto',
          fontSize: '0.85rem',
          fontFamily: 'monospace'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-secondary)' }}>Debug Info:</h4>
          {debugInfo.map((info, index) => (
            <div key={index} style={{ marginBottom: '4px', color: 'var(--text-muted)' }}>
              {info}
            </div>
          ))}
        </div>
        
        <button 
          onClick={() => window.location.reload()} 
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            background: 'var(--primary-blue)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} error={error} />;
  }

  return (
    <div style={{ minHeight: '100vh', padding: '20px' }}>
      <Navigation 
        username={user.email} 
        onLogout={handleLogout} 
      />
      
      {error && (
        <div style={{
          background: 'rgba(220, 53, 69, 0.1)',
          color: '#dc3545',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          {error}
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