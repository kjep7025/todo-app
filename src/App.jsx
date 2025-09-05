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
        console.log('Initializing app...');
        const currentUser = await getCurrentUser();
        console.log('Current user:', currentUser);
        if (currentUser) {
          setUser(currentUser);
          await loadTasks();
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        setError(error.message);
      } finally {
        console.log('App initialization complete');
        setLoading(false);
      }
    };

    initializeApp();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
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
      const { data, error } = await getTasks();
      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const handleAuthSuccess = (user) => {
    setUser(user);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setTasks([]);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const addTask = async (taskText, priority = 'medium') => {
    try {
      const { data, error } = await addTaskToDb(taskText, priority);
      if (error) throw error;
      if (data && data[0]) {
        setTasks(prevTasks => [...prevTasks, data[0]]);
      }
    } catch (error) {
      console.error('Error adding task:', error);
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
      console.error('Error toggling task:', error);
    }
  };

  const removeTask = async (taskId) => {
    try {
      const { error } = await deleteTask(taskId);
      if (error) throw error;
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error removing task:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div>Loading...</div>
        {error && <div style={{ color: '#ef4444', marginTop: '10px' }}>Error: {error}</div>}
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