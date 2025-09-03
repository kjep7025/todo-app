// Import React hooks and CSS styles
import { useState } from 'react'
import './App.css'

// Main App component
function App() {
  // State to store the current input (what the user types)
  const [task, setTask] = useState("")

  // State to store the list of tasks
  const [tasks, setTasks] = useState([])

  // Function to add a new task
  const addTask = () => {
    if (task.trim() === "") return // prevent empty tasks
    setTasks([...tasks, task])     // add new task to the list
    setTask("")                    // clear input after adding
  }

  return (
    <div className="app-container">
      {/* Title */}
      <h1>To-Do List</h1>

      {/* Input field and Add Task button */}
      <div className="input-section">
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)} // update task state as user types
          placeholder="Enter a task"
        />
        <button onClick={addTask}>Add Task</button>
      </div>

      {/* Task List */}
      <ul className="task-list">
        {tasks.map((t, index) => (
          <li key={index}>
            {/* Checkbox */}
            <input type="checkbox" />

            {/* Task text */}
            <span>{t}</span>

            {/* Delete button */}
            <button
              className="delete-btn"
              onClick={() => {
                // Filter out the deleted task by index
                const newTasks = tasks.filter((_, i) => i !== index)
                setTasks(newTasks)
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Export App component so it can be used in main.jsx
export default App
