import { useState } from 'react';
import './TodoList.css';

function TodoList({ tasks, onToggleTask, onRemoveTask, showCompleted = false }) {
  const [filter, setFilter] = useState('all');
  
  const filteredTasks = tasks.filter(task => {
    if (showCompleted) return task.completed;
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  return (
    <div className="todo-list-container">
      {!showCompleted && (
        <div className="task-stats">
          <div className="stat-item">
            <span className="stat-number">{activeTasks.length}</span>
            <span className="stat-label">Active</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{completedTasks.length}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{tasks.length}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>
      )}

      {!showCompleted && (
        <div className="filter-buttons">
          <button 
            className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('all')}
          >
            All Tasks
          </button>
          <button 
            className={filter === 'active' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('active')}
          >
            Active
          </button>
          <button 
            className={filter === 'completed' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>
      )}

      {filteredTasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>
            {showCompleted 
              ? "No completed tasks yet" 
              : filter === 'active' 
                ? "No active tasks" 
                : filter === 'completed'
                  ? "No completed tasks"
                  : "No tasks yet"
            }
          </h3>
          <p>
            {showCompleted 
              ? "Complete some tasks to see them here!" 
              : "Add a task to get started"}
          </p>
        </div>
      ) : (
        <ul className="task-list">
          {filteredTasks.map((task) => (
            <li key={task.id} className={`task ${task.completed ? 'completed' : ''}`}>
              <div className="task-content">
                <input 
                  type="checkbox" 
                  checked={task.completed}
                  onChange={() => onToggleTask(task.id)}
                  className="task-checkbox"
                />
                <span className="task-text">{task.text}</span>
                {task.completedAt && (
                  <span className="completion-time">
                    Completed {new Date(task.completedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              <button 
                className="delete" 
                onClick={() => onRemoveTask(task.id)}
                title="Delete task"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TodoList;