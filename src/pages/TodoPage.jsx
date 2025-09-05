import TaskInput from '../components/TaskInput';
import TodoList from '../components/TodoList';

function TodoPage({ tasks, onAddTask, onToggleTask, onRemoveTask }) {
  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Active Tasks</h2>
        <p>Manage your daily tasks and stay productive</p>
      </div>
      
      <TaskInput onAddTask={onAddTask} />
      <TodoList 
        tasks={tasks}
        onToggleTask={onToggleTask}
        onRemoveTask={onRemoveTask}
        showCompleted={false}
      />
    </div>
  );
}

export default TodoPage;