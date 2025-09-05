import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { supabase, getCurrentUser, getTasks, addTask as addTaskToDb, updateTask, deleteTask } from "./lib/supabase";
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

  // Simplified initialization
  useEffect(() => {
    let mounted = true;
    
    const initializeApp = async () => {
      try {
        // Add a small delay to ensure everything is ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const currentUser = await getCurrentUser();
        
        if (!mounted) return;
        
        if (currentUser) {
          setUser(currentUser);
          await loadTasks();
        }
      } catch (error) {
        if (mounted) {
          console.error('Error initializing app:', error);
          setError(error.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeApp();

    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      if (session?.user) {
        setUser(session.user);
        await loadTasks();
      } else {
        setUser(null);
        setTasks([]);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadTasks = async () => {
    try {
      const { data, error } = await getTasks();
      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setError(error.message);
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
    }
  };

  const addTask = async (taskText, priority = 'medium') => {
    if (!taskText || taskText.trim() === '') {
      return;
    }
    
    try {
      const { data, error } = await addTaskToDb(taskText, priority);
      if (error) throw error;
      if (data && data[0]) {
        setTasks(prevTasks => [...prevTasks, data[0]]);
      }
    } catch (error) {
      console.error('Error adding task:', error);
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
      console.error('Error toggling task:', error);
      setError(error.message);
    }
  };

  const removeTask = async (taskId) => {
    try {
      const { error } = await deleteTask(taskId);
      if (error) throw error;
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error removing task:', error);
      setError(error.message);
    }
  };

  // Show loading with timeout
  if (loading) {
    return (
      <div className="loading">
        <div>Loading your tasks...</div>
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
          </div>
        )}
      </div>
    );
  }

  // Show auth form if no user
  if (!user) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
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