import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { supabase, getCurrentUser, getTasks, addTask as addTaskToDb, updateTask, deleteTask } from "./lib/supabase";
import AuthForm from "./components/AuthForm";
import Navigation from "./components/Navigation";
import TodoPage from "./pages/TodoPage";
import CompletedPage from "./pages/CompletedPage";
import "./App.css";

function App() {
  // ---------- Authentication state ----------
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ---------- Task state ----------
  const [tasks, setTasks] = useState([]);

  // Check for existing session and load tasks
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Initializing app...');
        console.log('📍 Step 1: Getting current user');
        const currentUser = await getCurrentUser();
        console.log('👤 Current user:', currentUser?.email || 'No user');
        
        if (currentUser) {
          console.log('📍 Step 2: Setting user state');
          setUser(currentUser);
          console.log('📍 Step 3: Loading tasks');
          await loadTasks();
        } else {
          console.log('📍 No user found, showing auth form');
        }
      } catch (error) {
        console.error('❌ Error initializing app:', error);
        setError(error.message);
      } finally {
        console.log('✅ App initialization complete');
        setLoading(false);
      }
    };

    initializeApp();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.email || 'No user');
      if (session?.user) {
        setUser(session.user);
        await loadTasks();
      } else {
        setUser(null);
        setTasks([]);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadTasks = async () => {
    try {
      console.log('📋 Loading tasks...');
      const { data, error } = await getTasks();
      if (error) throw error;
      console.log('📋 Tasks loaded:', data?.length || 0);
      setTasks(data || []);
    } catch (error) {
      console.error('❌ Error loading tasks:', error);
      setError(error.message);
    }
  };

  const handleAuthSuccess = (user) => {
    console.log('✅ Auth success for:', user.email);
    setUser(user);
  };

  const handleLogout = async () => {
    try {
      console.log('👋 Logging out user...');
      await supabase.auth.signOut();
      setUser(null);
      setTasks([]);
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('❌ Error signing out:', error);
    }
  };

  const addTask = async (taskText, priority = 'medium') => {
    if (!taskText || taskText.trim() === '') {
      console.warn('⚠️ Attempted to add empty task');
      return;
    }
    
    try {
      console.log('➕ Adding task:', taskText, 'with priority:', priority);
      const { data, error } = await addTaskToDb(taskText, priority);
      if (error) throw error;
      if (data && data[0]) {
        setTasks(prevTasks => [...prevTasks, data[0]]);
        console.log('✅ Task added successfully:', data[0].text);
      }
    } catch (error) {
      console.error('❌ Error adding task:', error);
      setError(error.message);
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

      const { data, error } = await updateTask(taskId, updates);
      if (error) throw error;

      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.id === taskId ? { ...t, ...updates } : t
        )
      );
    } catch (error) {
      console.error('❌ Error toggling task:', error);
      setError(error.message);
    }
  };

  const removeTask = async (taskId) => {
    try {
      const { error } = await deleteTask(taskId);
      if (error) throw error;
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('❌ Error removing task:', error);
      setError(error.message);
    }
  };

  // Show loading state with more details
  if (loading) {
    return (
      <div className="loading">
        <div>🔄 Loading your tasks...</div>
        <div style={{ fontSize: '0.9rem', color: '#aaa', marginTop: '10px' }}>
          Connecting to database...
        </div>
        {error && (
          <div style={{ 
            color: '#ef4444', 
            marginTop: '15px', 
            padding: '10px', 
            background: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '6px',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            <strong>Error:</strong> {error}
            <br />
            <small>Check the browser console for more details</small>
          </div>
        )}
      </div>
    );
  }

  // ---------- Authentication form ----------
  if (!user) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  // ---------- Main app with routing ----------
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