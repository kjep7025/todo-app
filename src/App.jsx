import { useState } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState('medium');

  const addTask = () => {
    if (newTask.trim()) {
      const task = {
        id: Date.now(),
        text: newTask.trim(),
        priority,
        completed: false,
        createdAt: new Date().toISOString()
      };
      setTasks([task, ...tasks]);
      setNewTask('');
    }
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id 
        ? { ...task, completed: !task.completed, completedAt: !task.completed ? new Date().toISOString() : null }
        : task
    ));
  };

  const removeTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  return (
    <div className="app-container">
      <div className="header">
        <h1>📝 To-Do App</h1>
        <p>Simple task management that works!</p>
      </div>

      <div className="task-input-section">
        <div className="input-group">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="What needs to be done?"
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
            className="task-input"
          />
          <select 
            value={priority} 
            onChange={(e) => setPriority(e.target.value)}
            className="priority-select"
          >
            <option value="low">🟢 Low</option>
            <option value="medium">🟡 Medium</option>
            <option value="high">🔴 High</option>
          </select>
          <button onClick={addTask} className="add-btn">
            Add Task
          </button>
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <span className="stat-number">{activeTasks.length}</span>
          <span className="stat-label">Active</span>
        </div>
        <div className="stat">
          <span className="stat-number">{completedTasks.length}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat">
          <span className="stat-number">{tasks.length}</span>
          <span className="stat-label">Total</span>
        </div>
      </div>

      <div className="tasks-section">
        <h2>Active Tasks ({activeTasks.length})</h2>
        {activeTasks.length === 0 ? (
          <div className="empty-state">
            <p>🎉 No active tasks! Add one above to get started.</p>
          </div>
        ) : (
          <ul className="task-list">
            {activeTasks.map(task => (
              <li key={task.id} className="task">
                <div className="task-content">
                  <input 
                    type="checkbox" 
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                  />
                  <div className={`priority-dot priority-${task.priority}`}></div>
                  <span className="task-text">{task.text}</span>
                  <span className={`priority-badge priority-${task.priority}`}>
                    {task.priority.toUpperCase()}
                  </span>
                </div>
                <button onClick={() => removeTask(task.id)} className="delete-btn">
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        {completedTasks.length > 0 && (
          <>
            <h2>Completed Tasks ({completedTasks.length})</h2>
            <ul className="task-list">
              {completedTasks.map(task => (
                <li key={task.id} className="task completed">
                  <div className="task-content">
                    <input 
                      type="checkbox" 
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                    />
                    <div className={`priority-dot priority-${task.priority}`}></div>
                    <span className="task-text">{task.text}</span>
                    <span className="completion-time">
                      ✅ {new Date(task.completedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button onClick={() => removeTask(task.id)} className="delete-btn">
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

export default App;