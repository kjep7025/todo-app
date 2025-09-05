import { useState } from 'react';
import './TaskInput.css';

function TaskInput({ onAddTask }) {
  const [task, setTask] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (task.trim() === '') return;
    onAddTask(task.trim());
    setTask('');
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
        <button type="submit" className="primary add-btn">
          Add Task
        </button>
      </div>
    </form>
  );
}

export default TaskInput;