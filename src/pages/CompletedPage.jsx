import TodoList from '../components/TodoList';

function CompletedPage({ tasks, onToggleTask, onRemoveTask }) {
  const completedTasks = tasks.filter(task => task.completed);

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Completed Tasks</h2>
        <p>Great job! Here are all your completed tasks</p>
      </div>
      
      <TodoList 
        tasks={completedTasks}
        onToggleTask={onToggleTask}
        onRemoveTask={onRemoveTask}
        showCompleted={true}
      />
    </div>
  );
}

export default CompletedPage;