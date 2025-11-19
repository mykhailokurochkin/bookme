import { useAuth } from '../context/AuthContext';

export const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Dashboard</h1>
        <div>
          <span style={{ marginRight: '1rem' }}>Welcome, {user?.name}</span>
          <button onClick={() => logout()}>Logout</button>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>Your Rooms</h3>
        <p>No rooms yet.</p>
      </div>
    </div>
  );
};
