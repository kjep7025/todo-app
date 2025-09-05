import { useState } from 'react';
import './TaskInput.css';

function TaskInput({ onAddTask }) {
  const [task, setTask] = useState('');
  const [priority, setPriority] = useState('medium');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (task.trim() === '') {
      alert('Please enter a task description');
      return;
    }
    onAddTask(task.trim(), priority);
    setTask('');
    setPriority('medium');
  };

  return (
    <div className="task-input-container">
      <form className="task-input-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="What needs to be done?"
            className="task-input"
            autoFocus
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
          <button type="submit" className="add-task-btn">
            Add Task
          </button>
        </div>
      </form>
    </div>
  );
}

export default TaskInput;