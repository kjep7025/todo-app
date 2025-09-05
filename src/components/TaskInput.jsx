import { useState } from 'react';
import './TaskInput.css';

function TaskInput({ onAddTask }) {
  const [task, setTask] = useState('');
  const [priority, setPriority] = useState('medium');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (task.trim() === '') return;
    onAddTask(task.trim(), priority);
    setTask('');
    setPriority('medium');
  };

  return (
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
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
        <button type="submit" className="primary add-btn">
          Add Task
        </button>
      </div>
    </form>
  );
}

export default TaskInput;