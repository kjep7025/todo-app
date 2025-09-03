import { useState } from "react";
import "./App.css";

function App() {
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

  return (
    <div className="app">
      <h1>To-Do App</h1>

      <div className="add-row">
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Enter a task"
        />
        <button className="primary" onClick={addTask}>Add Task</button>
      </div>

      <div className="task-list">
        {tasks.map((t, index) => (
          <div className="task-row" key={index}>
            <input type="checkbox" />
            <span className="text">{t}</span>
            <button className="delete" onClick={() => removeTask(index)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
