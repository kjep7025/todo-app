import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navigation from "./components/Navigation";
import TodoPage from "./pages/TodoPage";
import CompletedPage from "./pages/CompletedPage";
import "./App.css";

function App() {
  // ---------- Authentication state ----------
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // ---------- Task state ----------
  const [tasks, setTasks] = useState([]);

  // Load saved data on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("loggedUser");
    const savedTasks = localStorage.getItem("todoTasks");
    
    if (savedUser) {
      setLoggedIn(true);
      setUsername(savedUser);
    }
    
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    if (loggedIn) {
      localStorage.setItem("todoTasks", JSON.stringify(tasks));
    }
  }, [tasks, loggedIn]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim() === "") {
      alert("Please enter a username to sign in.");
      return;
    }
    setLoggedIn(true);
    localStorage.setItem("loggedUser", username.trim());
    setPassword("");
  };

  const handleLogout = () => {
    setLoggedIn(false);
    localStorage.removeItem("loggedUser");
    localStorage.removeItem("todoTasks");
    setUsername("");
    setPassword("");
    setTasks([]);
  };

  const addTask = (taskText) => {
    const newTask = {
      id: Date.now() + Math.random(), // Simple ID generation
      text: taskText,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  const toggleTask = (taskId) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed ? new Date().toISOString() : null
            }
          : task
      )
    );
  };

  const removeTask = (taskId) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  // ---------- Login form ----------
  if (!loggedIn) {
    return (
      <div className="login-container">
        <h1>Sign in</h1>
        <form className="login-form" onSubmit={handleLogin}>
          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your name or email"
              autoFocus
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
            />
          </label>

          <div className="login-actions">
            <button type="submit" className="primary">Sign in</button>
          </div>
        </form>
        <p className="login-note">Demo login — any username works. Password is not verified.</p>
      </div>
    );
  }

  // ---------- Main app with routing ----------
  return (
    <div className="app-container">
      <Navigation username={username} onLogout={handleLogout} />
      
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