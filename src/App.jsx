// App.jsx
import { useState, useEffect } from "react";
import "./App.css";

function App() {
  // ---------- Authentication state ----------
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // optional: remember login across refresh (demo only)
  useEffect(() => {
    const savedUser = localStorage.getItem("loggedUser");
    if (savedUser) {
      setLoggedIn(true);
      setUsername(savedUser);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    // very simple "fake auth" check: require username
    if (username.trim() === "") {
      alert("Please enter a username to sign in.");
      return;
    }
    // mark as logged in and persist username (demo)
    setLoggedIn(true);
    localStorage.setItem("loggedUser", username.trim());
    setPassword(""); // clear password field
  };

  const handleLogout = () => {
    setLoggedIn(false);
    localStorage.removeItem("loggedUser");
    setUsername("");
    setPassword("");
  };

  // ---------- Todo state (existing features) ----------
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);

  const addTask = () => {
    if (task.trim() === "") return;
    setTasks([...tasks, task.trim()]);
    setTask("");
  };

  const removeTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  // ---------- Render: if not logged in -> show login form ----------
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

  // ---------- Logged-in app UI ----------
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>To-Do App</h1>
        <div className="user-actions">
          <span className="user-name">Signed in as <strong>{username}</strong></span>
          <button className="logout" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* Input row */}
      <div className="input-section">
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Enter a task"
        />
        <button className="primary" onClick={addTask}>Add Task</button>
      </div>

      {/* Task list */}
      <ul className="task-list">
        {tasks.map((t, index) => (
          <li key={index} className="task">
            <input type="checkbox" />
            <span>{t}</span>
            <button className="delete" onClick={() => removeTask(index)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
