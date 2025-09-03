import { useState } from 'react'
import './App.css'


function App() {
  const [task, setTask] = useState("");       // store what the user types
  const [tasks, setTasks] = useState([]);     // store all tasks

  const addTask = () => {
    if (task.trim() === "") return;           // ignore empty input
    setTasks([...tasks, task]);               // add new task to array
    setTask("");                              // clear the input
  };

  return (
    <div>
      <h1>To-Do App</h1>

      {/* Input field + button */}
      <input
        type="text"
        value={task}
        onChange={(e) => setTask(e.target.value)}
        placeholder="Enter a task"
      />
      <button onClick={addTask}>Add Task</button>

      {/* Render the list */}
      <ul>
  {tasks.map((t, index) => (
    <li key={index}>
      {t} {/* Task text */}
      <button 
        onClick={() => {
          const newTasks = tasks.filter((_, i) => i !== index); // remove this task
          setTasks(newTasks); // update state
        }}
        style={{ marginLeft: "10px" }}
      >
        Delete
      </button>
    </li>
  ))}
</ul>

    </div>
  );
}


export default App;