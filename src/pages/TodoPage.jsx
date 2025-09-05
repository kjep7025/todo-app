import TaskInput from '../components/TaskInput';
import TodoList from '../components/TodoList';
import './TodoPage.css';

function TodoPage({ tasks, onAddTask, onToggleTask, onRemoveTask }) {
  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  return (
    <div className="todo-page">
      <div className="todo-header">
        <div className="header-icon">📋</div>
        <h1>To-Do App</h1>
        <p>Simple task management that works!</p>
      </div>
      
      <TaskInput onAddTask={onAddTask} />
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{activeTasks.length}</div>
          <div className="stat-label">ACTIVE</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{completedTasks.length}</div>
          <div className="stat-label">COMPLETED</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{tasks.length}</div>
          <div className="stat-label">TOTAL</div>
        </div>
      </div>
      
      <div className="tasks-section">
        <h2>Active Tasks ({activeTasks.length})</h2>
        <TodoList 
          tasks={tasks}
          onToggleTask={onToggleTask}
          onRemoveTask={onRemoveTask}
          showCompleted={false}
        />
      </div>
    </div>
  );
}

export default TodoPage;