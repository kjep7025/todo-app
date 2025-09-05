import { NavLink } from 'react-router-dom';
import './Navigation.css';

function Navigation({ username, onLogout }) {
  return (
    <nav className="navigation">
      <div className="nav-links">
        <NavLink 
          to="/todo" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          📋 Active Tasks
        </NavLink>
        <NavLink 
          to="/completed" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          ✅ Completed
        </NavLink>
      </div>

      <div className="nav-user">
        <span className="user-name">
          👤 <strong>{username}</strong>
        </span>
        <button className="logout" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navigation;