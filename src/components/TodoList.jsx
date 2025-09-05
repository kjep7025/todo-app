import { useState } from 'react';
import './TodoList.css';

function TodoList({ tasks, onToggleTask, onRemoveTask, showCompleted = false }) {
  const [filter, setFilter] = useState('all');
  
  console.log('TodoList rendering with', tasks.length, 'tasks, showCompleted:', showCompleted);
  
  const filteredTasks = tasks.filter(task => {
    if (showCompleted) return task.completed;
    return !task.completed;
  });

  console.log('Filtered tasks:', filteredTasks.length);

  // Sort tasks by priority (high -> medium -> low) and then by creation date
  const sortedTasks = filteredTasks.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  
  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  return (
    <div className="todo-list-container">
      {sortedTasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎉</div>
          <p>
            {showCompleted 
              ? "No completed tasks yet" 
             : "No active tasks! Add one above to get started."
            }
          </p>
        </div>
      ) : (
        <ul className="task-list">
          {sortedTasks.map((task) => (
            <li key={task.id} className={`task ${task.completed ? 'completed' : ''}`}>
              <div className="task-content">
                <input 
                  type="checkbox" 
                  checked={task.completed}
                  onChange={() => onToggleTask(task.id)}
                  className="task-checkbox"
                />
                <div className={`priority-indicator priority-${task.priority}`}></div>
                <span className="task-text">{task.text}</span>
                <span className={`priority-label priority-${task.priority}`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
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